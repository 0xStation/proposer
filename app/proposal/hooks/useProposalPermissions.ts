import { ProposalRoleType } from "@prisma/client"
import useGetUsersRoles from "app/core/hooks/useGetUsersRoles"

export const useProposalPermissions = (proposalId, action: ProposalAction) => {
  const { roles } = useGetUsersRoles(proposalId)

  if (action === ProposalAction.DELETE) {
    return !!roles?.some((role) => role.type === ProposalRoleType.AUTHOR)
  }
}

export enum ProposalAction {
  DELETE,
  // add more
}
