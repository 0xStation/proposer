import { ProposalRoleType, ProposalStatus } from "@prisma/client"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useStore from "app/core/hooks/useStore"
import { Proposal } from "app/proposal/types"
import { ProposalMilestone } from "app/proposalMilestone/types"
import ExecutePaymentModal from "app/proposal/components/ExecutePaymentModal"

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
  const executePaymentModalMap = useStore((state) => state.executePaymentModalMap)
  const toggleExecutePaymentModalMap = useStore((state) => state.toggleExecutePaymentModalMap)
  const payment = proposal.payments?.find((payment) => payment.milestoneId === milestone.id)

  const status =
    proposal.currentMilestoneIndex > milestone.index
      ? StepStatus.complete
      : proposal.status === ProposalStatus.APPROVED &&
        proposal.currentMilestoneIndex === milestone.index
      ? StepStatus.current
      : StepStatus.upcoming

  const actions = {
    ...(true &&
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
    ...(true &&
      payment && {
        [ProposalRoleType.CONTRIBUTOR]: (
          <Button
            type={ButtonType.Secondary}
            onClick={() => toggleExecutePaymentModalMap({ open: true, id: payment.id })}
          >
            Pay
          </Button>
        ),
      }),
  }

  return (
    <>
      {payment && (
        <ExecutePaymentModal
          isOpen={executePaymentModalMap[payment.id] || false}
          setIsOpen={(open) => toggleExecutePaymentModalMap({ open, id: payment.id })}
          milestone={milestone}
          payment={payment}
        />
      )}
      <Step
        description={milestone.data.title}
        status={status}
        options={{ last: isLastStep }}
        actions={actions}
      />
    </>
  )
}

export default PaymentStep
