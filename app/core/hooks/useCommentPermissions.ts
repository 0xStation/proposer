import useGetUserRoles from "app/core/hooks/useGetUsersRoles"

const useCommentPermissions = (proposalId) => {
  const { roles: userRoles } = useGetUserRoles(proposalId)
  const canRead = true
  const canWrite = userRoles.length > 0

  return { canRead, canWrite }
}

export default useCommentPermissions
