import { useState, useEffect } from "react"
import { useQuery } from "blitz"
import { ProposalNew } from "app/proposalNew/types"
import { ProposalSignature } from "@prisma/client"
import { getGnosisSafeDetails } from "app/utils/getGnosisSafeDetails"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { AddressType } from "@prisma/client"
import useStore from "./useStore"
import getRolesByProposalId from "app/proposalRole/queries/getRolesByProposalId"
import { ProposalRole } from "app/proposalRole/types"

interface ProposalRoleType {
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
 * @param proposal: ProposalNew | undefined | null
 * (undefined or null bc we need to be able to call the hook before this data resolves from query)
 * @param signatures: Signature[] | undefined | null
 * (undefined or null bc we need to be able to call the hook before this data resolves from query)
 * @returns [remainingRoles, error, loading]: [RoleType[], any, boolean]
 *
 * the RoleType array response is a list of the remaining roles an active user still needs to sign for. Once those
 * roles are signed for this hook will not return them anymore. This is useful for determining if we should show the
 * user a sign button or not.
 *
 * A possible extension would pull the logic for determining if the user should sign or not into this hook, and extend
 * the return value to include "remaining roles" vs "signed roles".
 *
 * This might be useful if we have UI that requires we show which roles a particular user has signed for, after they
 * have signed. However, there are currently not UI elements that require that, so this leaner hook should be fine.
 */
const useGetUsersRemainingRolesToSignFor = (
  proposal: ProposalNew | undefined | null,
  signatures: ProposalSignature[] | undefined
) => {
  const activeUser = useStore((state) => state.activeUser)
  const [remainingRoles, setRemainingRoles] = useState<ProposalRoleType[]>([])
  const [error, setError] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [roles] = useQuery(
    getRolesByProposalId,
    { proposalId: proposal?.id as string },
    { suspense: false, enabled: Boolean(proposal?.id) }
  )

  const getRoles = async (roles: ProposalRole[], signatures: ProposalSignature[], activeUser) => {
    try {
      setLoading(true)
      const signers: ProposalRoleType[] = await Promise.all(
        roles?.map(async (role) => {
          // role is type wallet (single signer)
          // AND role's address is the active user
          if (
            role?.account?.addressType === AddressType.WALLET &&
            addressesAreEqual(role?.address, activeUser?.address || "")
          ) {
            return {
              roleType: role?.role,
              roleId: role?.id,
              address: role?.address,
              oneSignerNeededToComplete: true, // always true for unsigned single signer
            }
          } else if (role?.account?.addressType === AddressType.SAFE) {
            const gnosisSafeDetails = await getGnosisSafeDetails(
              role?.account.data.chainId || 1,
              role?.address
            )

            const totalSafeSignersSigned = signatures.filter((signature) => {
              return gnosisSafeDetails?.signers.some((signer) => {
                return addressesAreEqual(signature.address, signer)
              })
            }).length

            // for each signer on the safe
            // if the signer's address is the active user's address
            return gnosisSafeDetails?.signers.map((signer) => {
              if (addressesAreEqual(signer, activeUser?.address || "")) {
                return {
                  roleType: role?.role,
                  roleId: role?.id,
                  address: activeUser.address,
                  oneSignerNeededToComplete:
                    totalSafeSignersSigned === gnosisSafeDetails?.quorum - 1, // last signer sets true
                }
              }
            })
          }
        })
      )

      // I wanted to write this as a reducer so I could build up the list of roles
      // but I couldn't figure out how to run async / await calls to gnosis in a reduce function
      // So, the list is mapped over, which means some are null, and some are nested.
      // Mapping over the signers leaves a nested array like [x, x, [x, x]] so flat turns it into [x, x, x, x]
      // the filter((a) => a) is shorthand to remove nulls
      setRemainingRoles(signers.flat().filter((a) => a))
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (signatures && roles && activeUser) {
      const hasActiveUserSigned = signatures.some((signature) => {
        return addressesAreEqual(signature.address, activeUser?.address || "")
      })
      // If the active user has generated a signature, there is no reason to sign again.
      // So we set the roles remaining to empty and loading to false.
      // see post comment at the bottom of the file.
      if (hasActiveUserSigned) {
        setRemainingRoles([])
        setLoading(false)
      } else if (proposal && activeUser) {
        getRoles(roles as ProposalRole[], signatures, activeUser)
      }
    }
  }, [proposal, signatures, activeUser, roles])

  return [remainingRoles, error, loading] as [ProposalRoleType[], any, boolean]
}

export default useGetUsersRemainingRolesToSignFor

/**
 * POST COMMENTS
 *
 * 1.
 * This is my biggest complaint about this code, because it relies on the assumption that the existance of a
 * signature implies the existance of a role having been accounted for. But this is not necessarily true.
 * For our system, it is true almost all of the time, but it doesn't mean it's impossible to have a role that is
 * status - incomplete with address xyz while xyz has already genereated a signature.
 * Even though our code won't allow it, its a valid state in the database.
 *
 * a better solution might be to look at the relationship between signatures and roles.
 * That way we would be able to tell which roles a user is accountable for, and if the signature of the user has been
 * linked to that particular role. It would allow a cleaner determination of if the user signing really means they have
 * signed each role.
 */
