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

  let response
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal, // allows for the fetch api request to be aborted if triggered https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
    })
  } catch (err) {
    console.error(err)
    return null
  }

  if (response.status > 299 || response.status < 200) {
    // assume it's a personal wallet
    return null
  }

  const results = await response.json()

  return {
    chainId,
    address,
    quorum: results.threshold,
    signers: results.owners,
    version: results.version,
  }
}
