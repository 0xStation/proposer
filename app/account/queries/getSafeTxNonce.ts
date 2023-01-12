import * as z from "zod"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import networks from "app/utils/networks.json"

const GetSafeTxNonce = z.object({
  chainId: z.number(),
  address: z.string(),
  safeTxHash: z.string(),
})

export default async function getSafeTxNonce(input: z.infer<typeof GetSafeTxNonce>) {
  const params = GetSafeTxNonce.parse(input)
  const network = networks[params.chainId]?.gnosisNetwork
  if (!network) {
    throw Error("chainId not available on Gnosis")
  }
  // only absolute urls supported
  const url = `https://safe-transaction-${network}.safe.global/api/v1/safes/${toChecksumAddress(
    params.address
  )}/multisig-transactions?safe_tx_hash=${params.safeTxHash}`
  let response

  response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (response.status === 404) {
    // assume it's a personal wallet
    return null
  }

  const results = await response.json()
  return results.results[0].nonce
}
