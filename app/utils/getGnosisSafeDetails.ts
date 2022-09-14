import { toChecksumAddress } from "app/core/utils/checksumAddress"
import networks from "./networks.json"

/**
 * Fetches the details of a Gnosis Safe for a particular chainId and address
 */
export const getGnosisSafeDetails = async (chainId: number, address: string, signal?: any) => {
  const network = networks[chainId]?.gnosisNetwork
  if (!network) {
    throw Error("chainId not available on Gnosis")
  }
  const url = `https://safe-transaction.${network}.gnosis.io/api/v1/safes/${toChecksumAddress(
    address
  )}`
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    signal,
  })

  if (response.status === 404) {
    // assume it's a personal wallet
    return null
  }

  const results = await response.json()

  return {
    chainId,
    address,
    quorum: results.threshold,
    signers: results.owners,
  }
}
