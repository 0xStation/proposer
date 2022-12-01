import useGetUsersParticipants from "app/proposalParticipant/hooks/useGetUsersParticipants"

const useCommentPermissions = (proposalId) => {
  const { participants } = useGetUsersParticipants(proposalId)

  const canRead = true
  const canWrite = participants.length > 0

  return { canRead, canWrite }
}

export default useCommentPermissions
