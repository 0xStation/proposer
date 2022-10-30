import { ProposalStatus } from "@prisma/client"
import useStore from "app/core/hooks/useStore"
import { Proposal } from "app/proposal/types"
import { ProposalMilestone } from "app/proposalMilestone/types"
import ExecutePaymentModal from "app/proposal/components/ExecutePaymentModal"
import QueueGnosisTransactionModal from "app/proposalPayment/components/QueueGnosisTransactionModal"
import ApproveGnosisTransactionModal from "app/proposalPayment/components/ApproveGnosisTransactionModal"
import PaymentAction from "../actions/PaymentAction"

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

  const status =
    proposal.currentMilestoneIndex > milestone.index
      ? StepStatus.complete
      : proposal.status === ProposalStatus.APPROVED &&
        proposal.currentMilestoneIndex === milestone.index
      ? StepStatus.current
      : StepStatus.upcoming

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
        // subtitle={
        //   userIsSigner &&
        //   payment &&
        //   !!payment.data.multisigTransaction &&
        //   !!userHasSignedGnosisTx &&
        //   !quorumMet
        //     ? "You have already approved this payment, waiting for others to sign until the tx reaches quorum."
        //     : ""
        // }
        options={{ last: isLastStep }}
        action={<PaymentAction proposal={proposal} milestone={milestone} />}
      />
    </>
  )
}

export default PaymentStep
