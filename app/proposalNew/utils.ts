import { ProposalRoleApprovalStatus } from "@prisma/client"

// returns true if all signatures are complete for a given proposal to be approved
export const areApprovalsComplete = (proposalRoles) => {
  return proposalRoles?.every((role) => {
    role.approvalStats === ProposalRoleApprovalStatus.COMPLETE
  })
}
