import "app/core/utils/addressesAreEqual"
import useStore from "app/core/hooks/useStore"
import { useParticipants } from "./useParticipants"
import { ProposalParticipant } from "../types"
import { addressRepresentsAccount } from "app/core/utils/addressRepresentsAccount"

// Get the roles the activeUser has permission over via address-ownership or safe-signership
export const useGetUsersParticipants = (
  proposalId: string | undefined | null
): { participants: ProposalParticipant[]; isLoading: boolean } => {
  const activeUser = useStore((state) => state.activeUser)
  const { participants, isLoading } = useParticipants(proposalId)

  return {
    participants:
      participants?.filter((participant) =>
        addressRepresentsAccount(activeUser?.address || "", participant.account)
      ) || [],
    isLoading,
  }
}

export default useGetUsersParticipants
