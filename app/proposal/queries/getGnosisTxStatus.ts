import * as z from "zod"
import networks from "app/utils/networks.json"

const GetGnosisTxStatus = z.object({
  chainId: z.number(),
  safeTxHash: z.string(),
  proposalId: z.string(),
  milestoneId: z.string(),
})

export default async function getGnosisTxStatus(params: z.infer<typeof GetGnosisTxStatus>) {
  const input = GetGnosisTxStatus.parse(params)

  if (!input.safeTxHash) {
    console.error("No safeTxHash provided")
    return
  }

  // thinking we could first check if the proposalCurrentMilestone is on the milestone that is being passed in
  // to see if we should even be checking the gnosis tx status is processed or not.
  // but then we are running extra db calls for nothing.
  // so right now we are calling the gnosis API needlessly if the tx is already processed, which is bad too.
  // really it would be great if we had a background queue so we could only call the gnosis API when we need to.

  const apiHost = networks[input.chainId]?.gnosisApi
  if (!apiHost) {
    throw Error("chainId not available on Gnosis")
  }

  const url = `${apiHost}/api/v1/multisig-transactions/${input.safeTxHash}/`

  let response
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (err) {
    console.error(err)
    return null
  }

  const results = await response.json()
  return results
}
