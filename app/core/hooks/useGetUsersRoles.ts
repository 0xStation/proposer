import { useQuery } from "blitz"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { AddressType } from "@prisma/client"
import useStore from "./useStore"
import getRolesByProposalId from "app/proposalRole/queries/getRolesByProposalId"
import { ProposalRoleWithSignatures } from "app/proposalRole/types"

// Get the roles the activeUser has permission over via address-ownership or safe-signership
export const useGetUsersRoles = (
  proposalId: string | undefined | null
): { roles: ProposalRoleWithSignatures[]; isLoading: boolean } => {
  const activeUser = useStore((state) => state.activeUser)
  const [roles, { isLoading }] = useQuery(
    getRolesByProposalId,
    { proposalId: proposalId as string },
    {
      suspense: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled: Boolean(proposalId),
      staleTime: 60 * 1000, // 1 minute
    }
  )

  return {
    roles:
      roles?.filter(
        (role) =>
          // account is WALLET and active user is address
          (role?.account?.addressType === AddressType.WALLET &&
            addressesAreEqual(role?.address, activeUser?.address || "")) ||
          // account is SAFE and active user is a signer
          (role?.account?.addressType === AddressType.SAFE &&
            role?.account?.data?.signers?.some((signer) =>
              addressesAreEqual(signer, activeUser?.address || "")
            ))
      ) || [],
    isLoading,
  }
}

export default useGetUsersRoles
