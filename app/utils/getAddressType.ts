import { getGnosisSafeDetails } from "./getGnosisSafeDetails"
import { CHAIN_IDS } from "app/core/utils/constants"
import { AddressType } from "@prisma/client"

/**
 * Determines if an address is a Gnosis Safe and if so, on which chain
 */
export const getAddressType = async (address): Promise<{ type: AddressType; chainId: number }> => {
  const validChainIds = Object.values(CHAIN_IDS)
  const requests = validChainIds.map((chainId) => getGnosisSafeDetails(chainId, address))
  const responses = await Promise.all(requests)

  for (let i in validChainIds) {
    if (!!responses[i]) {
      return {
        type: AddressType.SAFE,
        chainId: validChainIds[i]!,
      }
    }
  }

  // assuming if the address is not a Gnosis Safe on the supported networks, then this is a Personal Wallet
  // this is a problematic assumption and needs to be improved
  return {
    type: AddressType.WALLET,
    chainId: 0,
  }
}
