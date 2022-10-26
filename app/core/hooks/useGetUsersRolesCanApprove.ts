import { useState, useEffect } from "react"
import { useQuery } from "blitz"
import "app/core/utils/addressesAreEqual"
import { AddressType, ProposalRoleApprovalStatus, ProposalRoleType } from "@prisma/client"
import useStore from "./useStore"
import useGetUserRoles from "./useGetUsersRoles"
import { ProposalRoleWithSignatures } from "app/proposalRole/types"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"

const useGetUsersRolesCanApprove = (proposalId: string | undefined | null) => {
  const activeUser = useStore((state) => state.activeUser)
  const { roles: userRoles, isLoading } = useGetUserRoles(proposalId)

  const awaitingApproval = userRoles
    .filter((role) => {
      // filter on PENDING status
      role.approvalStatus === ProposalRoleApprovalStatus.PENDING &&
        // filter on user having not signed already
        !role.signatures.some((signature) => {
          return addressesAreEqual(signature.address, activeUser?.address || "")
        })
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
    }) as (ProposalRoleWithSignatures & { oneSignerNeededToComplete: boolean })[]

  return { roles: awaitingApproval, isLoading }
}

export default useGetUsersRolesCanApprove
