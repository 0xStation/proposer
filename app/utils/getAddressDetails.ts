import { getGnosisSafeDetails } from "./getGnosisSafeDetails"
import { CHAIN_IDS } from "app/core/utils/constants"
import { AddressType } from "@prisma/client"
// import { AlchemyProvider } from "@ethersproject/providers"
// import networks from "./networks.json"
// import { requireEnv } from "./requireEnv"

/**
 * Fetches guild members for a Discord server
 * Discord imposes a limit of querying 1000 members at a time,
 * so we have this recursive algorithm to keep fetching until we have
 * all members and return them as one list
 */
export const getAddressDetails = async (
  address
): Promise<{ type: AddressType; chainId: number }> => {
  const validChainIds = Object.values(CHAIN_IDS)
  const requests = validChainIds.map((chainId) => getGnosisSafeDetails(chainId, address))
  const responses = await Promise.all(requests)

  console.log("address", address)

  for (let i in validChainIds) {
    if (!!responses[i]) {
      return {
        type: AddressType.SAFE,
        chainId: validChainIds[i]!,
      }
    }
  }

  return {
    type: AddressType.WALLET,
    chainId: 0,
  }
}
