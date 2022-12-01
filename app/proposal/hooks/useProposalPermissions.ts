import useGetUsersParticipants from "app/proposalParticipant/hooks/useGetUsersParticipants"

export const useProposalPermissions = (proposalId) => {
  const { participants } = useGetUsersParticipants(proposalId)

  return { canEdit: participants.some((participant) => !!participant?.data?.isOwner) }
}
