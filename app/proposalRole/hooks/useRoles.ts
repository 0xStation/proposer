import { useQuery } from "@blitzjs/rpc"
import getRolesByProposalId from "../queries/getRolesByProposalId"

export const useRoles = (proposalId) => {
  const [roles, { isLoading }] = useQuery(
    getRolesByProposalId,
    { proposalId: proposalId as string },
    {
      suspense: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled: !!proposalId,
      staleTime: 60 * 1000, // 1 minute
    }
  )

  return { roles, isLoading }
}
