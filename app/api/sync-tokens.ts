import db from "db"
import { TagTokenMetadata, TagType } from "app/tag/types"
import { multicall } from "app/utils/rpcMulticall"
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
  // 1. Get tokens of terminal

  let tokens = await db.tag.findMany({
    where: { terminalId: req.body.terminalId, type: TagType.TOKEN },
  })
  tokens = tokens.sort(
    (a, b) => (b.data as TagTokenMetadata).chainId - (a.data as TagTokenMetadata).chainId
  )

  // 2. Get accounts with addresses and their token tags

  const memberships = await db.accountTerminal.findMany({
    where: {
      terminalId: req.body.terminalId,
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

  // 3. Get token ownership per account via multicall

  // balanceOf abi works for both ERC20 & ERC721
  const abi = ["function balanceOf(address owner) view returns (uint256 balance)"]
  // generate call list, one per membership per token
  let promises: any[] = []
  let currentChainId = (tokens[0]?.data as TagTokenMetadata).chainId
  let currentChainCalls: any[][3] = []
  tokens.forEach((t) => {
    const tokenChain = (t.data as TagTokenMetadata).chainId
    if (tokenChain !== currentChainId) {
      promises.push(multicall(currentChainId.toString(), abi, currentChainCalls))
      currentChainId = tokenChain
      currentChainCalls = []
    }
    memberships.forEach((m) => {
      // console.log(m)
      currentChainCalls.push([
        toChecksumAddress((t.data as TagTokenMetadata).address),
        "balanceOf",
        [toChecksumAddress(m.account.address as string)],
      ])
    })
  })
  promises.push(multicall(currentChainId.toString(), abi, currentChainCalls))

  // await all multicall requests separated by chainId
  let results = await Promise.all(promises)
  // concat all results together
  results = [].concat(...results)

  if (results.length == 0) {
    res.status(200).json({ response: "success" })
    return
  }

  // 4. Look at set difference between token ownership and tags and update database

  memberships.forEach(async (m, i) => {
    const existingTags = m.tags.map((t) => t.tagId)

    // take slice of response calls for this user (order preserved throughout whole process)
    // grab every i of a membership.length cycle repeating tokens.length times
    const subset: any[] = []
    for (let j = 0; j < tokens.length; j++) {
      const arrIndex = i + j * memberships.length
      subset.push(results[arrIndex])
    }

    // sort balance values >0 or =0 into different buckets
    // v.balance values are ethers.BigNumber objects
    const owns = subset.filter((v) => v.balance.gt(0)).map((v, i) => tokens[i]?.id as number)
    const doesNotOwn = subset.filter((v) => v.balance.eq(0)).map((v, i) => tokens[i]?.id)
    // compare owned tags to owned tokens
    const tagsToRemove = existingTags.filter((tagId) => doesNotOwn.includes(tagId))
    const tagsToAdd = owns.filter((tagId) => !existingTags.includes(tagId))
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
