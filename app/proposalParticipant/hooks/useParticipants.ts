import { useQuery } from "@blitzjs/rpc"
import getParticipantsByProposal from "../queries/getParticipantsByProposal"

export const useParticipants = (proposalId) => {
  const [participants] = useQuery(
    getParticipantsByProposal,
    { proposalId: proposalId as string },
    {
      suspense: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled: !!proposalId,
      staleTime: 60 * 1000, // 1 minute
    }
  )

  return participants
}
