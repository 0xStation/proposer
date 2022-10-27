import { ProposalRoleType, ProposalStatus } from "@prisma/client"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useStore from "app/core/hooks/useStore"
import { Proposal } from "app/proposal/types"
import { ProposalMilestone } from "app/proposalMilestone/types"
import useGetUsersRolesToSignFor from "app/core/hooks/useGetUsersRolesToSignFor"
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
  const executePaymentModalOpen = useStore((state) => state.executePaymentModalOpen)
  const toggleExecutePaymentModalOpen = useStore((state) => state.toggleExecutePaymentModalOpen)
  const payment = proposal.payments?.find((payment) => payment.milestoneId === milestone.id)

  const status =
    proposal.currentMilestoneIndex > milestone.index
      ? StepStatus.complete
      : proposal.status === ProposalStatus.APPROVED &&
        proposal.currentMilestoneIndex === milestone.index
      ? StepStatus.current
      : StepStatus.upcoming

  const [remainingRoles, _signedRoles, _error, _loading] = useGetUsersRolesToSignFor(proposal)

  const actions = {
    ...(true && {
      [ProposalRoleType.CLIENT]: (
        <Button type={ButtonType.Secondary} onClick={() => toggleExecutePaymentModalOpen(true)}>
          Pay
        </Button>
      ),
    }),
    ...(true && {
      [ProposalRoleType.CONTRIBUTOR]: (
        <Button type={ButtonType.Secondary} onClick={() => toggleExecutePaymentModalOpen(true)}>
          Pay
        </Button>
      ),
    }),
  }

  return (
    <>
      {payment && (
        <ExecutePaymentModal
          isOpen={executePaymentModalOpen}
          setIsOpen={toggleExecutePaymentModalOpen}
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
