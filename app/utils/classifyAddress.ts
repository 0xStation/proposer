import { getGnosisSafeDetails } from "./getGnosisSafeDetails"
import { CHAIN_IDS } from "app/core/utils/constants"
import { AddressType } from "app/types"
// import { AlchemyProvider } from "@ethersproject/providers"
// import networks from "./networks.json"
// import { requireEnv } from "./requireEnv"

/**
 * Fetches guild members for a Discord server
 * Discord imposes a limit of querying 1000 members at a time,
 * so we have this recursive algorithm to keep fetching until we have
 * all members and return them as one list
 */
export const classifyAddress = async (address) => {
  const validChainIds = Object.values(CHAIN_IDS)
  const requests = validChainIds.map((chainId) => getGnosisSafeDetails(chainId, address))
  const responses = await Promise.all(requests)

  const isSafe = responses.some((val) => !!val)

  return isSafe ? AddressType.SAFE : AddressType.WALLET
}
