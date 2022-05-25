import db from "db"
import { Terminal } from "app/terminal/types"
import { TagTokenMetadata, TagType } from "app/tag/types"
import { multicall } from "app/utils/rpcMulticall"

/**
 * API endpoint for "refreshing" token ownership tags for members of a Station terminal.
 * When a terminal first adds a token, the members with that token are synced.
 *
 * @param req - { terminalId: number }
 * @param res - 200 or 401
 * @returns {response: "success"}
 */
export default async function handler(req, res) {
  const params = JSON.parse(req.body)

  // get tokens of terminal
  const tokens = await db.tag.findMany({
    where: { terminalId: params.terminalId, type: TagType.TOKEN },
  })

  // get accounts with addresses and their token tags
  const memberships = await db.accountTerminal.findMany({
    where: {
      terminalId: params.terminalId,
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

  // get token ownership per account via multicall
  const network = "1" // eth mainnet
  const provider = null
  const abi = ["function balanceOf(address owner) view returns (uint256 balance)"] // works for both ERC20 & ERC721
  let calls: any[] = []
  memberships.forEach((m) => {
    tokens.forEach((t) => {
      calls.push([(t.data as TagTokenMetadata).address, "balanceOf", m.account.address])
    })
  })

  const response = await multicall(network, provider, abi, calls)

  let membershipObj = {}

  response.forEach((value, i) => {
    const address = calls[i][2]
    if (!membershipObj[address]) {
      membershipObj[address] = {
        [calls[i][0]]: value,
      }
    } else {
      membershipObj[address][calls[i][0]] = value
    }
  })

  // take set difference between on-chain data and current AccountTerminalTags

  // remove tags for tokens no longer owned, add tags for new token ownership

  // better error handling and success messages prob but im exhausted rn
  res.status(200).json({ response: "success" })
}
