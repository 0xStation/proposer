import db from "db"
import { api } from "app/blitz-server"
import { NextApiRequest, NextApiResponse } from "next"
import SaveTransactionHashToPayments from "app/proposal/mutations/saveTransactionToPayments"
import { GNOSIS_EXECUTION_SUCCESS_EVENT_HASH } from "app/core/utils/constants"
import { multicall } from "app/utils/rpcMulticall"
import { Account } from "app/account/types"
import { ProposalPayment } from "app/proposalPayment/types"

const fetchGnosisNonce = async (chainId: string, targetAddress: string) => {
  const abi = ["function nonce() view returns (uint256 nonce)"]

  const metadata = await multicall(chainId, abi, [
    { targetAddress: targetAddress, functionSignature: "nonce", callParameters: [] },
  ])

  const nonce = metadata[0]?.nonce
  return nonce
}

export default api(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const response = req.body
  const streamId = response.streamId
  console.log(response)

  // eventually look for error logs as well
  const gnosisTxSuccessEventLog = response.logs.find(
    (log) => log.topic0 === GNOSIS_EXECUTION_SUCCESS_EVENT_HASH
  )

  // I experimented with returning 400s but moralis did not like receiving a 400 in response to a rebhook
  // so instead we just terminate early
  if (!gnosisTxSuccessEventLog) {
    return res.end()
  }

  const account = (await db.account.findFirst({
    where: {
      moralisStreamId: streamId,
    },
  })) as Account

  // honestly, something has probably gone wrong in the database if we recieve a webhook
  // for an account that does not exist or is not a safe.
  if (!account || account.addressType !== "SAFE") {
    return res.end()
  }

  const nonce = await fetchGnosisNonce(String(account.data.chainId || 1), account.address)
  console.log("nonce", nonce)

  const payment = (await db.proposalPayment.findFirst({
    where: {
      senderAddress: account.address,
      data: {
        path: ["multisigTransaction", "nonce"],
        equals: nonce - 1,
      },
    },
  })) as ProposalPayment

  // might be a transaction that is not a station transaction
  if (!payment) {
    return res.end()
  }

  const txData = gnosisTxSuccessEventLog.data
  const safeTxHash = txData.slice(0, 66)

  // webhook is a successful transaction response
  if (payment?.data?.multisigTransaction?.safeTxHash === safeTxHash) {
    if (!payment.transactionHash) {
      try {
        await SaveTransactionHashToPayments({
          milestoneId: payment.milestoneId,
          proposalId: payment.proposalId,
          transactionHash: gnosisTxSuccessEventLog.transactionHash,
          paymentId: payment.id,
        })
      } catch (e) {
        console.log(e)
      }
    }
  } else {
    // probably want to save the transaction hash here as well, in order to track the transaction
    // even though it was "rejected" it still has a transaction confirmation
    await db.proposalPayment.update({
      where: { id: payment.id },
      data: {
        ...payment,
        isRejected: true,
      },
    })
  }

  res.statusCode = 200
  res.end()
})
