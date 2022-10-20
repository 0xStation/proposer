import * as z from "zod"
import networks from "app/utils/networks.json"
import SaveTransactionHashToPayments from "../mutations/saveTransactionToPayments"

const GetGnosisTxStatus = z.object({
  chainId: z.number(),
  transactionHash: z.string(),
  proposalId: z.string(),
  milestoneId: z.string(),
})

export default async function getGnosisTxStatus(params: z.infer<typeof GetGnosisTxStatus>) {
  const input = GetGnosisTxStatus.parse(params)

  const apiHost = networks[input.chainId]?.gnosisApi
  if (!apiHost) {
    throw Error("chainId not available on Gnosis")
  }

  const url = `${apiHost}/api/v1/multisig-transactions/${input.transactionHash}/`

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

  // even if the tx is declined it returns true for isExecuted and isSuccessful
  // honestly not sure how to tell if it was "declined" based on the API response
  // need to dig more, but want to start by focusing on the success case since thats
  // almost certainly more likely.
  const results = await response.json()
  if (results.isExecuted) {
    try {
      await SaveTransactionHashToPayments({
        milestoneId: input.milestoneId,
        proposalId: input.proposalId,
        transactionHash: results.transactionHash,
      })
    } catch (e) {
      // if we are catching because we have already processed this milestone -- return true
      if (e.message.includes("proposal is not on milestone:")) {
        return true
      }
      return false
    }
    return true
  }
  return false
}
