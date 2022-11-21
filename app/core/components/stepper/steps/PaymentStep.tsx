import { useEffect } from "react"
import { ProposalStatus } from "@prisma/client"
import useStore from "app/core/hooks/useStore"
import { Proposal } from "app/proposal/types"
import { ProposalMilestone } from "app/proposalMilestone/types"
import ExecutePaymentModal from "app/proposal/components/ExecutePaymentModal"
import QueueGnosisTransactionModal from "app/proposalPayment/components/QueueGnosisTransactionModal"
import ReQueueGnosisTransactionModal from "app/proposalPayment/components/ReQueueGnosisTransactionModal"
import ApproveGnosisTransactionModal from "app/proposalPayment/components/ApproveGnosisTransactionModal"
import PaymentAction from "../actions/PaymentAction"
import { useStepperStore } from "../StepperRenderer"
import Step, { StepStatus, StepType } from "./Step"

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
  const reQueueGnosisTransactionModalMap = useStore(
    (state) => state.reQueueGnosisTransactionModalMap
  )
  const queueGnosisTransactionModalMap = useStore((state) => state.queueGnosisTransactionModalMap)
  const toggleQueueGnosisTransactionModalMap = useStore(
    (state) => state.toggleQueueGnosisTransactionModalMap
  )
  const toggleReQueueGnosisTransactionModalMap = useStore(
    (state) => state.toggleReQueueGnosisTransactionModalMap
  )
  const approveGnosisTransactionModalMap = useStore(
    (state) => state.approveGnosisTransactionModalMap
  )
  const toggleApproveGnosisTransactionModalMap = useStore(
    (state) => state.toggleApproveGnosisTransactionModalMap
  )

  const status =
    proposal.currentMilestoneIndex > milestone.index
      ? StepStatus.COMPLETE
      : proposal.status === ProposalStatus.APPROVED &&
        proposal.currentMilestoneIndex === milestone.index
      ? StepStatus.CURRENT
      : StepStatus.UPCOMING

  const setActiveStep = useStepperStore((state) => state.setActiveStep)
  useEffect(() => {
    if (status === StepStatus.CURRENT) {
      setActiveStep(StepType.PAYMENT)
    }
  }, [status])

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
          {/* TODO: make sure original payment is actually the original payment */}
          {/* The way we are finding the payment with a `find` is maybe sketchy and error prone */}
          <ReQueueGnosisTransactionModal
            milestone={milestone}
            originalPayment={payment}
            isOpen={reQueueGnosisTransactionModalMap[payment.id] || false}
            setIsOpen={(open) => toggleReQueueGnosisTransactionModalMap({ open, id: payment.id })}
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
        isLastStep={isLastStep}
        action={<PaymentAction proposal={proposal} milestone={milestone} />}
      />
    </>
  )
}

export default PaymentStep
