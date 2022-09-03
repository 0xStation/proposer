import * as z from "zod"
import { multicall } from "app/utils/rpcMulticall"
import { getGnosisSafeDetails } from "app/utils/getGnosisSafeDetails"
import { getAddressDetails } from "app/utils/getAddressDetails"

const MultisigMetadataRequest = z.object({
  address: z.string(),
})

/**
 * Fetches token information provided a chain and address.
 *
 * @param req
 * @param res
 * @returns token metadata object on success or failure message if no token exists
 */
export default async function handler(req, res) {
  let params
  try {
    params = MultisigMetadataRequest.parse(req.body)
  } catch (e) {
    console.log(e)
    res.status(500).json({ response: "error", message: "missing required parameter" })
  }

  const safe = await getAddressDetails(params.address)
  if (!safe) {
    res.status(404).json({ message: "safe not found " })
    return
  }

  res.status(200).json({ response: "success", data: safe })
}
