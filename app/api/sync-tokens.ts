import db from "db"
import { TagTokenMetadata, TagType } from "app/tag/types"
import { AtomicCall, multicall } from "app/utils/rpcMulticall"
import { toChecksumAddress } from "app/core/utils/checksumAddress"

/**
 * API endpoint for "refreshing" token ownership tags for members of a Station terminal.
 * When a terminal first adds a token, the members with that token are synced.
 * 1. Get tokens of terminal
 * 2. Get accounts with addresses and their token tags
 * 3. Get token ownership per account via multicall
 * 4. Look at set difference between token ownership and tags and update database
 *
 * @param req - { terminalId: number }
 * @param res - 200 or 401
 * @returns {response: "success"}
 */
export default async function handler(req, res) {
  const terminalId = JSON.parse(req.body).terminalId

  if (terminalId === null) {
    res.status(500).json({ response: "Terminal ID must be not null" })
    return
  }

  // 1. Get tokens of terminal

  let tokens = await db.tag.findMany({
    where: { terminalId, type: TagType.TOKEN },
  })

  if (tokens.length === 0) {
    res.status(200).json({ response: "success" })
    return
  }

  // sort tokens by chainId so that multicalls can be shared by tokens on same chain
  const sortedTokens = tokens.sort(
    (a, b) => (b.data as TagTokenMetadata).chainId - (a.data as TagTokenMetadata).chainId
  )

  // 2. Get accounts with addresses and their token tags

  const memberships = await db.accountTerminal.findMany({
    where: {
      terminalId,
      account: {
        NOT: {
          address: null,
        },
      },
    },
    include: {
      account: true,
      tags: {
        where: {
          tag: {
            type: TagType.TOKEN,
          },
        },
      },
    },
  })

  if (memberships.length === 0) {
    res.status(200).json({ response: "success" })
    return
  }

  // 3. Get token ownership per account via multicall

  // balanceOf abi works for both ERC20 & ERC721
  const abi = ["function balanceOf(address owner) view returns (uint256 balance)"]
  // split multicalls by chainId so that multiple tokens on same chain can share one multicall
  // per chain, generate a call list with one call per membership per token
  let promises: any[] = []
  let currentChainId = (sortedTokens[0]?.data as TagTokenMetadata).chainId
  let currentChainCalls: AtomicCall[] = []
  sortedTokens.forEach((t) => {
    const tokenChain = (t.data as TagTokenMetadata).chainId
    if (tokenChain !== currentChainId) {
      const calls = JSON.parse(JSON.stringify(currentChainCalls)) // hard copy to prevent side-effects risk
      promises.push(multicall(currentChainId.toString(), abi, calls))
      currentChainId = tokenChain
      currentChainCalls = []
    }
    memberships.forEach((m) => {
      currentChainCalls.push({
        targetAddress: (t.data as TagTokenMetadata).address,
        functionSignature: "balanceOf",
        callParameters: [toChecksumAddress(m.account.address as string)],
      })
    })
  })
  // add current chain call list to complete loop
  promises.push(multicall(currentChainId.toString(), abi, currentChainCalls))

  // await all multicall requests separated by chainId
  const completedPromises = await Promise.all(promises)
  // concat all results together
  const results: any[] = [].concat(...completedPromises)

  // 4. Look at set difference between token ownership and tags and update database

  memberships.forEach(async (m, i) => {
    const existingTagIds = m.tags.map((t) => t.tagId)

    // take slice of response calls for this user (order preserved throughout whole process)
    // grab every i of a membership.length cycle repeating tokens.length times
    const subset: any[] = []
    for (let j = 0; j < sortedTokens.length; j++) {
      const arrIndex = i + j * memberships.length
      subset.push({
        tagId: sortedTokens[j]?.id,
        balance: results[arrIndex].balance,
      })
    }

    // sort balance values >0 or =0 into different buckets
    // v.balance values are ethers.BigNumber objects
    const owns = subset.filter((v) => v.balance.gt(0)).map((v) => v.tagId)
    const doesNotOwn = subset.filter((v) => v.balance.eq(0)).map((v) => v.tagId)
    // compare owned tags to owned tokens
    const tagsToRemove = existingTagIds.filter((tagId) => doesNotOwn.includes(tagId))
    const tagsToAdd = owns.filter((tagId) => !existingTagIds.includes(tagId))
    if (tagsToRemove.length === 0 && tagsToAdd.length === 0) {
      return
    }
    // genrate prisma object to delete or create AccountTerminalTag objects
    const updateTagsPrismaObj = {
      ...(tagsToRemove.length > 0 && {
        deleteMany: tagsToRemove.map((tagId) => {
          return {
            tagId,
          }
        }),
      }),
      ...(tagsToAdd.length > 0 && {
        connectOrCreate: tagsToAdd.map((tagId) => {
          return {
            where: {
              tagId_ticketAccountId_ticketTerminalId: {
                tagId,
                ticketAccountId: m.accountId,
                ticketTerminalId: m.terminalId,
              },
            },
            create: {
              tagId,
            },
          }
        }),
      }),
    }
    // submit update query for membership's token tags
    await db.accountTerminal.update({
      where: { accountId_terminalId: { accountId: m.accountId, terminalId: m.terminalId } },
      data: {
        tags: updateTagsPrismaObj,
      },
    })
  })

  res.status(200).json({ response: "success" })
}
