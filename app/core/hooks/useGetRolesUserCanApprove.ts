import "app/core/utils/addressesAreEqual"
import { AddressType, ProposalRoleApprovalStatus } from "@prisma/client"
import useStore from "./useStore"
import useGetUserRoles from "./useGetUsersRoles"
import { ProposalRoleWithSignatures } from "app/proposalRole/types"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"

// Get the roles the activeUser can approve for based on the roles' approval status and user's previous signatures
const useGetRolesUserCanApprove = (
  proposalId: string | undefined | null
): {
  roles: (ProposalRoleWithSignatures & { oneSignerNeededToComplete: boolean })[]
  isLoading: boolean
} => {
  const activeUser = useStore((state) => state.activeUser)
  const { roles: userRoles, isLoading } = useGetUserRoles(proposalId)

  const awaitingApproval = userRoles
    .filter((role) => {
      // filter on PENDING status
      return (
        role.approvalStatus === ProposalRoleApprovalStatus.PENDING &&
        // filter on user having not signed already
        // to be used by multisigs that can collect many signatures while role is PENDING
        !role.signatures.some((signature) => {
          return addressesAreEqual(signature.address, activeUser?.address)
        })
      )
    })
    .map((role) => {
      return {
        ...role,
        oneSignerNeededToComplete:
          // if account is a wallet, only one signature is needed to complete approval
          role.account?.addressType === AddressType.WALLET
            ? true
            : // if account is a safe, current signature count is one less than quorum
              role.signatures.length + 1 === role.account?.data.quorum,
      }
    })

  return { roles: awaitingApproval, isLoading }
}

export default useGetRolesUserCanApprove
