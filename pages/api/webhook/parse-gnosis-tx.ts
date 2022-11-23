import db from "db"
import { api } from "app/blitz-server"
import { NextApiRequest, NextApiResponse } from "next"
import SaveTransactionHashToPayments from "app/proposal/mutations/saveTransactionToPayments"
import { GNOSIS_EXECUTION_SUCCESS_EVENT_HASH } from "app/core/utils/constants"
import { multicall } from "app/utils/rpcMulticall"
import { Account } from "app/account/types"
import { ProposalPayment, ProposalPaymentStatus } from "app/proposalPayment/types"

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

  // TODO: get feedback on this line -- really annoying that we have to parse through every single payment
  // ever from a particular account just to find the matching payment
  const accountPayments = (await db.proposalPayment.findMany({
    where: {
      senderAddress: account.address,
    },
  })) as ProposalPayment[]

  let payment
  let mostRecentPaymentAttempt
  for (let i = accountPayments.length - 1; i >= 0; i--) {
    const currentPayment = accountPayments[i]
    const paymentAttempt = currentPayment?.data?.history?.slice(-1)[0]
    // nonce is a BigNumber, so we need to unwrap it
    // nonce is incremented after a successful transaction, so we need to subtract 1 to match to previous tx
    if (paymentAttempt?.multisigTransaction?.nonce === nonce.toNumber() - 1) {
      payment = currentPayment
      mostRecentPaymentAttempt = paymentAttempt
      break
    }
  }

  // webhook might be responding to transaction that is not a station transaction
  // because we cannot find it
  if (!mostRecentPaymentAttempt || !payment) {
    return res.end()
  }

  const txData = gnosisTxSuccessEventLog.data
  const safeTxHash = txData.slice(0, 66)

  // webhook is a successful transaction response
  if (mostRecentPaymentAttempt.multisigTransaction?.safeTxHash === safeTxHash) {
    if (mostRecentPaymentAttempt.status === ProposalPaymentStatus.QUEUED) {
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
        data: {
          ...payment.data,
          history: [
            ...payment.data.history.slice(0, payment.data.history.length - 1),
            {
              ...mostRecentPaymentAttempt,
              transactionHash: gnosisTxSuccessEventLog.transactionHash,
              status: ProposalPaymentStatus.REJECTED,
              timestamp: new Date(),
            },
          ] as any, // required or else typescript complains about the type history
        },
      },
    })
  }

  res.statusCode = 200
  res.end()
})
