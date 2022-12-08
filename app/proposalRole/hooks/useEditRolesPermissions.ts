import { ProposalRoleType } from "@prisma/client"
import useGetUsersRoles from "app/core/hooks/useGetUsersRoles"

export const useEditRolesPermissions = (proposalId, roleType: ProposalRoleType) => {
  const { roles } = useGetUsersRoles(proposalId)

  return roles.some((role) => role.type === roleType || role.type === ProposalRoleType.AUTHOR)
}
