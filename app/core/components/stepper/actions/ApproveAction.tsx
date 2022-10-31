import { ProposalRoleType } from "@prisma/client"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useGetRolesUserCanApprove from "app/core/hooks/useGetRolesUserCanApprove"
import { useStepperStore } from "../StepperRenderer"
import useStore from "app/core/hooks/useStore"

const ApproveAction = ({ proposal }) => {
  const activeRole = useStepperStore((state) => state.activeRole)
  const { roles: rolesUserCanApprove } = useGetRolesUserCanApprove(proposal.id)
  const activeUserHasRolesToSign = rolesUserCanApprove.length > 0
  const toggleProposalApprovalModalOpen = useStore((state) => state.toggleProposalApprovalModalOpen)

  const actions = {
    ...(activeUserHasRolesToSign && {
      [ProposalRoleType.CLIENT]: (
        <Button type={ButtonType.Secondary} onClick={() => toggleProposalApprovalModalOpen(true)}>
          Approve
        </Button>
      ),
      [ProposalRoleType.CONTRIBUTOR]: (
        <Button type={ButtonType.Secondary} onClick={() => toggleProposalApprovalModalOpen(true)}>
          Approve
        </Button>
      ),
    }),
  }

  if (activeRole && actions[activeRole]) {
    return actions[activeRole]
  } else {
    return <></>
  }
}

export default ApproveAction
