import { getGnosisSafeDetails } from "./getGnosisSafeDetails"
import { SUPPORTED_CHAIN_IDS } from "app/core/utils/constants"
import { AddressType } from "@prisma/client"

/**
 * Determines if an address is a Gnosis Safe and if so, on which chain
 */
export const getAddressType = async (
  address
): Promise<{ addressType: AddressType; chainId: number }> => {
  const requests = SUPPORTED_CHAIN_IDS.map((chainId) => getGnosisSafeDetails(chainId, address))
  const responses = await Promise.all(requests)

  for (let i in SUPPORTED_CHAIN_IDS) {
    if (!!responses[i]) {
      return {
        addressType: AddressType.SAFE,
        chainId: SUPPORTED_CHAIN_IDS[i]!,
      }
    }
  }

  // assuming if the address is not a Gnosis Safe on the supported networks, then this is a Personal Wallet
  // this is a problematic assumption and needs to be improved
  return {
    addressType: AddressType.WALLET,
    chainId: 0,
  }
}
