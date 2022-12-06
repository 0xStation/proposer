import db from "db"
import { api } from "app/blitz-server"
import { NextApiRequest, NextApiResponse } from "next"
import SaveTransactionHashToPayments from "app/proposal/mutations/saveTransactionToPayments"
import RetroactivelyApproveProposal from "app/proposal/mutations/retroactivelyApproveProposal"
import {
  GNOSIS_CHANGED_THRESHOLD_EVENT_HASH,
  GNOSIS_EXECUTION_SUCCESS_EVENT_HASH,
} from "app/core/utils/constants"
import { multicall } from "app/utils/rpcMulticall"
import { Account } from "app/account/types"
import { ProposalPayment, ProposalPaymentStatus } from "app/proposalPayment/types"
import { ProposalStatus } from "@prisma/client"

const fetchGnosisThreshold = async (chainId: string, targetAddress: string) => {
  const abi = ["function getThreshold() public view returns (uint256)"]

  const metadata = await multicall(chainId, abi, [
    { targetAddress: targetAddress, functionSignature: "getThreshold", callParameters: [] },
  ])

  const threshold = metadata[0][0]
  return threshold.toNumber()
}

const fetchGnosisNonce = async (chainId: string, targetAddress: string) => {
  const abi = ["function nonce() view returns (uint256 nonce)"]

  const metadata = await multicall(chainId, abi, [
    { targetAddress: targetAddress, functionSignature: "nonce", callParameters: [] },
  ])

  const nonce = metadata[0]?.nonce
  return nonce
}

const handleChangedThreshold = async (account) => {
  const threshold = await fetchGnosisThreshold(String(account.data.chainId || 1), account.address)
  const allAccountRoles = await db.proposalRole.findMany({
    where: {
      address: account.address,
    },
    include: {
      account: true,
      proposal: true,
      signatures: true,
    },
  })

  for (let index in allAccountRoles) {
    const role = allAccountRoles[index]
    const status = role?.proposal?.status
    if (!role) {
      continue
    }
    // only consider proposals that have not yet been approved
    if (status === ProposalStatus.AWAITING_APPROVAL || status === ProposalStatus.DRAFT) {
      let account = role?.account as Account
      let signatures = role?.signatures

      // with the change to the threshold, we should now consider the proposal approved
      if (signatures?.length || 0 >= threshold) {
        await RetroactivelyApproveProposal({ proposalId: role?.proposal.id, roleId: role.id })
      }
    }
  }
}

const handleExecutionSuccess = async (account, log) => {
  const nonce = await fetchGnosisNonce(String(account.data.chainId || 1), account.address)

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
  // because we cannot find it. Or, the tx is not in queued state, so we dont want to change it.
  if (
    !mostRecentPaymentAttempt ||
    !payment ||
    mostRecentPaymentAttempt.status !== ProposalPaymentStatus.QUEUED
  ) {
    throw new Error("Could not find payment attempt")
  }

  const txData = log.data
  const safeTxHash = txData.slice(0, 66)

  // webhook is a successful transaction response
  if (mostRecentPaymentAttempt.multisigTransaction?.safeTxHash === safeTxHash) {
    if (mostRecentPaymentAttempt.status === ProposalPaymentStatus.QUEUED) {
      try {
        await SaveTransactionHashToPayments({
          milestoneId: payment.milestoneId,
          proposalId: payment.proposalId,
          transactionHash: log.transactionHash,
          paymentId: payment.id,
        })
      } catch (e) {
        console.log(e)
      }
    }
  } else {
    // probably want to make sure the most recent is queued and not success
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
              transactionHash: log.transactionHash,
              status: ProposalPaymentStatus.REJECTED,
              timestamp: new Date(),
            },
          ] as any, // required or else typescript complains about the type history
        },
      },
    })
  }
}

const handleExecutionFailure = async () => {
  // pass
}

export default api(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const response = req.body
  const streamId = response.streamId

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

  const gnosisChangedThresholdEventLog = response.logs.find(
    (log) => log.topic0 === GNOSIS_CHANGED_THRESHOLD_EVENT_HASH
  )

  if (gnosisChangedThresholdEventLog) {
    await handleChangedThreshold(account)
    res.statusCode = 200
    return res.end()
  }

  // eventually look for error logs as well
  const gnosisTxSuccessEventLog = response.logs.find(
    (log) => log.topic0 === GNOSIS_EXECUTION_SUCCESS_EVENT_HASH
  )

  if (!gnosisTxSuccessEventLog) {
    res.statusCode = 500
    return res.end()
  }

  try {
    console.log("we have a successful tx event")
    await handleExecutionSuccess(account, gnosisTxSuccessEventLog)
    res.statusCode = 200
    return res.end()
  } catch (e) {
    console.log(e)
    res.statusCode = 500
    return res.end()
  }
})
