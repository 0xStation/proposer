import { toChecksumAddress } from "app/core/utils/checksumAddress"
import networks from "./networks.json"

/**
 * Fetches guild members for a Discord server
 * Discord imposes a limit of querying 1000 members at a time,
 * so we have this recursive algorithm to keep fetching until we have
 * all members and return them as one list
 */
export const getGnosisSafeDetails = async (chainId: number, address: string) => {
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
  })
  if (response.status === 404) {
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
