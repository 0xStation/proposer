import { useEffect, useState } from "react"
import { useQuery } from "blitz"
import { ProposalRoleType, ProposalStatus, AddressType } from "@prisma/client"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useStore from "app/core/hooks/useStore"
import useGetUsersRoles from "app/core/hooks/useGetUsersRoles"
import { Proposal } from "app/proposal/types"
import { ProposalMilestone, ProposalMilestoneStatus } from "app/proposalMilestone/types"
import ExecutePaymentModal from "app/proposal/components/ExecutePaymentModal"
import QueueGnosisTransactionModal from "app/proposalPayment/components/QueueGnosisTransactionModal"
import ApproveGnosisTransactionModal from "app/proposalPayment/components/ApproveGnosisTransactionModal"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { getMilestoneStatus } from "app/proposalMilestone/utils"
import getGnosisTxStatus from "app/proposal/queries/getGnosisTxStatus"

import Step, { StepStatus } from "./Step"

const PaymentStep = ({
  milestone,
  proposal,
  isLastStep,
}: {
  milestone: ProposalMilestone
  proposal: Proposal
  isLastStep?: boolean
}) => {
  const payment = proposal.payments?.find((payment) => payment.milestoneId === milestone.id)
  const { roles: userRoles } = useGetUsersRoles(proposal.id)
  const userClientRole = userRoles.find((role) => role.type === ProposalRoleType.CLIENT)
  const userIsPayer = userClientRole
    ? userClientRole.account?.addressType === AddressType.WALLET
    : false
  const userIsSigner = userClientRole
    ? userClientRole.account?.addressType === AddressType.SAFE
    : false

  const [quorumMet, setQuorumMet] = useState<boolean>(false)
  const [userHasSignedGnosisTx, setUserHasSignedGnosisTx] = useState<boolean>(false)
  const activeUser = useStore((state) => state.activeUser)
  const executePaymentModalMap = useStore((state) => state.executePaymentModalMap)
  const toggleExecutePaymentModalMap = useStore((state) => state.toggleExecutePaymentModalMap)
  const queueGnosisTransactionModalMap = useStore((state) => state.queueGnosisTransactionModalMap)
  const toggleQueueGnosisTransactionModalMap = useStore(
    (state) => state.toggleQueueGnosisTransactionModalMap
  )
  const approveGnosisTransactionModalMap = useStore(
    (state) => state.approveGnosisTransactionModalMap
  )
  const toggleApproveGnosisTransactionModalMap = useStore(
    (state) => state.toggleApproveGnosisTransactionModalMap
  )

  const [gnosisTxStatus] = useQuery(
    getGnosisTxStatus,
    {
      chainId: payment?.data.token.chainId || 1,
      transactionHash: payment?.data.multisigTransaction?.safeTxHash || "",
      proposalId: proposal.id,
      milestoneId: milestone.id,
    },
    {
      suspense: false,
      // refetchOnWindowFocus defaults to true so switching tabs will re-trigger query for immediate response feel
      refetchInterval: 30 * 1000, // 30 seconds, background refresh rate in-case user doesn't switch around tabs
      enabled:
        // payment exists
        payment &&
        // milestone is in progress
        getMilestoneStatus(proposal, milestone) === ProposalMilestoneStatus.IN_PROGRESS &&
        // payment is still pending
        !payment.transactionHash &&
        // payment has been queued to Gnosis
        !!payment.data.multisigTransaction?.safeTxHash,
    }
  )

  useEffect(() => {
    if (userIsSigner && gnosisTxStatus) {
      const quorum = userClientRole?.account?.data.quorum ?? 1
      const confirmations = gnosisTxStatus.confirmations
      const userHasSignedGnosisSafeTx = confirmations.some((confirmation) =>
        addressesAreEqual(confirmation.owner, activeUser?.address || "")
      )
      setUserHasSignedGnosisTx(userHasSignedGnosisSafeTx)
      if (confirmations.length >= quorum) {
        setQuorumMet(true)
      }
    }
  }, [userIsSigner, gnosisTxStatus])

  const status =
    proposal.currentMilestoneIndex > milestone.index
      ? StepStatus.complete
      : proposal.status === ProposalStatus.APPROVED &&
        proposal.currentMilestoneIndex === milestone.index
      ? StepStatus.current
      : StepStatus.upcoming

  const actions = {
    ...(userIsPayer &&
      payment && {
        [ProposalRoleType.CLIENT]: (
          <Button
            type={ButtonType.Secondary}
            onClick={() => toggleExecutePaymentModalMap({ open: true, id: payment.id })}
          >
            Pay
          </Button>
        ),
      }),
    // user is signer on the gnosis safe
    // and payment exists (typescript)
    // and there is not yet any mutliSigTransaction data on the payment, meaning it is not queued
    ...(userIsSigner &&
      payment &&
      !payment.data.multisigTransaction && {
        [ProposalRoleType.CLIENT]: (
          <Button
            type={ButtonType.Secondary}
            onClick={() => toggleQueueGnosisTransactionModalMap({ open: true, id: payment.id })}
          >
            Queue transaction
          </Button>
        ),
      }),
    // user is signer on the gnosis safe
    // and payment exists (typescript)
    // and there IS mutliSigTransaction data on the payment, meaning it has been queued
    // and the user has not yet signed the gnosis tx
    ...(userIsSigner &&
      payment &&
      !!payment.data.multisigTransaction &&
      !userHasSignedGnosisTx && {
        [ProposalRoleType.CLIENT]: (
          <Button
            type={ButtonType.Secondary}
            onClick={() => toggleApproveGnosisTransactionModalMap({ open: true, id: payment.id })}
          >
            Approve
          </Button>
        ),
      }),
  }

  return (
    <>
      {payment && (
        <>
          <ExecutePaymentModal
            isOpen={executePaymentModalMap[payment.id] || false}
            setIsOpen={(open) => toggleExecutePaymentModalMap({ open, id: payment.id })}
            milestone={milestone}
            payment={payment}
          />
          <QueueGnosisTransactionModal
            milestone={milestone}
            payment={payment}
            isOpen={queueGnosisTransactionModalMap[payment.id] || false}
            setIsOpen={(open) => toggleQueueGnosisTransactionModalMap({ open, id: payment.id })}
          />
          <ApproveGnosisTransactionModal
            payment={payment}
            isOpen={approveGnosisTransactionModalMap[payment.id] || false}
            setIsOpen={(open) => toggleApproveGnosisTransactionModalMap({ open, id: payment.id })}
          />
        </>
      )}
      <Step
        description={milestone.data.title}
        status={status}
        subtitle={
          userIsSigner && payment && !!payment.data.multisigTransaction && !!userHasSignedGnosisTx
            ? "You have already approved this payment, waiting for others to sign until the tx reaches quorum."
            : ""
        }
        options={{ last: isLastStep }}
        actions={actions}
      />
    </>
  )
}

export default PaymentStep
