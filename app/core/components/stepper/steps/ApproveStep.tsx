import { ProposalRoleType, ProposalStatus } from "@prisma/client"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useStore from "app/core/hooks/useStore"
import { Proposal } from "app/proposal/types"
import useGetRolesUserCanApprove from "app/core/hooks/useGetRolesUserCanApprove"
import Step, { StepStatus } from "./Step"

const ApproveStep = ({ proposal }: { proposal: Proposal }) => {
  const { roles: rolesUserCanApprove } = useGetRolesUserCanApprove(proposal.id)
  const activeUserHasRolesToSign = rolesUserCanApprove.length > 0

  const status =
    proposal.status === ProposalStatus.APPROVED || proposal.status === ProposalStatus.COMPLETE
      ? StepStatus.complete
      : proposal.status === ProposalStatus.DRAFT
      ? StepStatus.upcoming
      : StepStatus.current

  const toggleProposalApprovalModalOpen = useStore((state) => state.toggleProposalApprovalModalOpen)

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
      actions={actions}
    />
  )
}

export default ApproveStep
