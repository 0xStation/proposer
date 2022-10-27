import { ProposalRoleType, ProposalStatus } from "@prisma/client"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useStore from "app/core/hooks/useStore"
import { Proposal } from "app/proposal/types"
import { ProposalMilestone } from "app/proposalMilestone/types"
import useGetUsersRolesToSignFor from "app/core/hooks/useGetUsersRolesToSignFor"
import Step, { StepStatus } from "./Step"

const PaymentStep = ({
  milestone,
  proposal,
}: {
  milestone: ProposalMilestone
  proposal: Proposal
}) => {
  console.log(milestone)
  const status =
    proposal.status === ProposalStatus.APPROVED
      ? StepStatus.complete
      : proposal.status === ProposalStatus.DRAFT
      ? StepStatus.upcoming
      : StepStatus.current

  const toggleProposalApprovalModalOpen = useStore((state) => state.toggleProposalApprovalModalOpen)
  const [remainingRoles, _signedRoles, _error, _loading] = useGetUsersRolesToSignFor(proposal)
  const activeUserHasRolesToSign = remainingRoles.length > 0

  const actions = {
    ...(activeUserHasRolesToSign && {
      [ProposalRoleType.CLIENT]: (
        <Button type={ButtonType.Secondary} onClick={() => toggleProposalApprovalModalOpen(true)}>
          Approve
        </Button>
      ),
    }),
    ...(activeUserHasRolesToSign && {
      [ProposalRoleType.CONTRIBUTOR]: (
        <Button type={ButtonType.Secondary} onClick={() => toggleProposalApprovalModalOpen(true)}>
          Approve
        </Button>
      ),
    }),
  }

  return (
    <Step
      description={milestone.data.title}
      status={status}
      options={{ last: true }}
      actions={actions}
    />
  )
}

export default PaymentStep
