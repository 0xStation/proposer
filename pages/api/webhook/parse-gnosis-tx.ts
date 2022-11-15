import db from "db"
import { api } from "app/blitz-server"
import { NextApiRequest, NextApiResponse } from "next"
import SaveTransactionHashToPayments from "app/proposal/mutations/saveTransactionToPayments"
import { GNOSIS_EXECUTION_SUCCESS_EVENT_HASH } from "app/core/utils/constants"

export default api(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const response = req.body

  const gnosisTxEventLog = response.logs.find(
    (log) => log.topic0 === GNOSIS_EXECUTION_SUCCESS_EVENT_HASH
  )

  // I experimented with returning 400s but moralis did not like receiving a 400 in response to a rebhook
  // so instead we just terminate early
  if (!gnosisTxEventLog) {
    return res.end()
  }

  const txData = gnosisTxEventLog.data
  const safeTxHash = txData.slice(0, 66)

  const proposalPayment = await db.proposalPayment.findFirst({
    where: {
      data: {
        path: ["multisigTransaction", "safeTxHash"],
        equals: safeTxHash,
      },
    },
  })

  // I experimented with returning 400s but moralis did not like receiving a 400 in response to a rebhook
  // so instead we just terminate early
  if (!proposalPayment) {
    return res.end()
  }

  // only run if no transaction hash has been saved
  // its possible the webhook gets run more than once
  // so we want to protect against that
  if (!proposalPayment.transactionHash) {
    try {
      await SaveTransactionHashToPayments({
        milestoneId: proposalPayment.milestoneId,
        proposalId: proposalPayment.proposalId,
        transactionHash: gnosisTxEventLog.transactionHash,
      })
    } catch (e) {
      // again, there's not much we can really do when catching an error in a webhook
      console.error(e)
    }
  }

  res.statusCode = 200
  res.end()
})
