import { useState, useEffect } from "react"
import { useQuery } from "blitz"
import { Proposal } from "app/proposal/types"
import { getGnosisSafeDetails } from "app/utils/getGnosisSafeDetails"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { AddressType, ProposalRoleType } from "@prisma/client"
import useStore from "./useStore"
import getRolesByProposalId from "app/proposalRole/queries/getRolesByProposalId"
import { ProposalRoleWithSignatures } from "app/proposalRole/types"

interface RoleWithSignerCompletionStatus {
  roleType: string
  roleId: string
  address: string
  // roles have a status representing if the role is completely signed for (multi-sigs need many signatures)
  // this boolean flag represents if the next signer is the signer that pushes the role into 'complete' status
  oneSignerNeededToComplete: boolean
}

/**
 * Hook for fetching the roles a user still needs to sign for given a proposal and the associated signatures.
 *
 * @param proposal: Proposal | undefined | null
 * (undefined or null bc we need to be able to call the hook before this data resolves from query)
 * @returns [remainingRoles, signedRoles, error, loading]: [RoleType[], any, boolean]
 *
 * the remainingRoles array response is a list of the remaining roles an active user still needs to sign for. Once those
 * roles are signed for this hook will not return them anymore. This is useful for determining if we should show the
 * user a sign button or not.
 *
 * the signedRoles array response is a list of roles that an active user has already signed for. This is useful for
 * determining if a user is a signer, but has already signed.
 *
 * A possible extension would pull the logic for determining if the user should sign or not into this hook, and extend
 * the return value to include "remaining roles" vs "signed roles".
 *
 * This might be useful if we have UI that requires we show which roles a particular user has signed for, after they
 * have signed. However, there are currently not UI elements that require that, so this leaner hook should be fine.
 */
const useGetUsersRolesToSignFor = (proposal: Proposal | undefined | null) => {
  const activeUser = useStore((state) => state.activeUser)
  const [remainingRoles, setRemainingRoles] = useState<RoleWithSignerCompletionStatus[]>([])
  const [signedRoles, setSignedRoles] = useState<ProposalRoleWithSignatures[]>([])
  const [error, setError] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [roles] = useQuery(
    getRolesByProposalId,
    { proposalId: proposal?.id as string },
    {
      suspense: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled: Boolean(proposal?.id),
      cacheTime: 60 * 10000, // ten minutes in milliseconds
    }
  )

  const getRoles = async (roles: ProposalRoleWithSignatures[], activeUser) => {
    try {
      setLoading(true)
      const remaining: RoleWithSignerCompletionStatus[] = []
      const signed: ProposalRoleWithSignatures[] = []

      for (const role of roles) {
        if (
          role?.account?.addressType === AddressType.WALLET &&
          addressesAreEqual(role?.address, activeUser?.address || "")
        ) {
          if (role.approvalStatus === "APPROVED") {
            signed.push(role)
          } else if (role.type !== ProposalRoleType.AUTHOR) {
            // only ask for a signature on this role if it is not an author
            // without this check, the author's indicator for "SENT" will get overriden with "APPROVE"
            remaining.push({
              roleType: role?.type,
              roleId: role?.id,
              address: role?.address,
              oneSignerNeededToComplete: true, // always true for unsigned single signer
            })
          }
          continue
        } else if (role?.account?.addressType === AddressType.SAFE) {
          const gnosisSafeDetails = await getGnosisSafeDetails(
            role?.account.data.chainId || 1,
            role?.address
          )

          const totalSafeSignersSigned = role.signatures.length

          for (const signer of gnosisSafeDetails?.signers) {
            if (addressesAreEqual(signer, activeUser?.address || "")) {
              if (
                role.signatures.some((signature) => {
                  return addressesAreEqual(signature.address, activeUser?.address || "")
                })
              ) {
                signed.push(role)
                break
              }
              if (totalSafeSignersSigned < gnosisSafeDetails?.quorum) {
                remaining.push({
                  roleType: role?.type,
                  roleId: role?.id,
                  address: activeUser.address,
                  oneSignerNeededToComplete:
                    totalSafeSignersSigned === gnosisSafeDetails?.quorum - 1, // last signer sets true
                })
              }
            }
          }
        }
      }

      setRemainingRoles(remaining)
      setSignedRoles(signed)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setRemainingRoles([])
    setSignedRoles([])

    if (roles && activeUser) {
      getRoles(roles, activeUser)
    } else if (!activeUser) {
      setLoading(false)
    }
  }, [JSON.stringify(roles), activeUser])

  return [remainingRoles, signedRoles, error, loading] as [
    RoleWithSignerCompletionStatus[],
    ProposalRoleWithSignatures[],
    any,
    boolean
  ]
}

export default useGetUsersRolesToSignFor
