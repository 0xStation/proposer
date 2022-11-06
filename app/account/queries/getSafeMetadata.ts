import * as z from "zod"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import networks from "app/utils/networks.json"

const GetSafeMetadata = z.object({
  chainId: z.number(),
  address: z.string(),
})

export default async function getSafeMetadata(input: z.infer<typeof GetSafeMetadata>) {
  const params = GetSafeMetadata.parse(input)
  const network = networks[params.chainId]?.gnosisNetwork
  if (!network) {
    throw Error("chainId not available on Gnosis")
  }
  // only absolute urls supported
  const url = `https://safe-transaction-${network}.safe.global/api/v1/safes/${toChecksumAddress(
    params.address
  )}`
  let response
  try {
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
    return {
      chainId: params.chainId,
      address: params.address,
      quorum: results.threshold,
      signers: results.owners,
    }
  } catch (err) {
    console.error(err)
    return null
  }
}
