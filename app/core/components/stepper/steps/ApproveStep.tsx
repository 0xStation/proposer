import { ProposalRoleType, ProposalStatus } from "@prisma/client"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useStore from "app/core/hooks/useStore"
import { Proposal } from "app/proposal/types"
import useGetUsersRolesToSignFor from "app/core/hooks/useGetUsersRolesToSignFor"
import Step, { StepStatus } from "./Step"

const ApproveStep = ({ proposal }: { proposal: Proposal }) => {
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
      description="Signers approve proposal"
      subtitle="Reach out to signers on twitter or Discord to get proposals reviewed and approved."
      status={status}
      options={{ last: true }}
      actions={actions}
    />
  )
}

export default ApproveStep
