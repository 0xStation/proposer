import { useState, useEffect } from "react"
import { ProposalNew } from "app/proposalNew/types"
import { getGnosisSafeDetails } from "app/utils/getGnosisSafeDetails"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import useStore from "./useStore"

interface RoleType {
  roleType: string
  roleId: string
  address: string
  willBeComplete: boolean
}

// return roles that an active user is a signer on
const useGetRolesForProposalApprover = (proposal: ProposalNew | undefined | null, signatures) => {
  const activeUser = useStore((state) => state.activeUser)
  const [roles, setRoles] = useState<RoleType[]>([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState<boolean>(true)

  const getRoles = async (proposal, activeUser) => {
    try {
      setLoading(true)
      const signers: RoleType[] = await Promise.all(
        // role needs to have account on it
        // make typescript check for this
        proposal.roles.map(async (role) => {
          if (
            role.account?.addressType === "WALLET" &&
            addressesAreEqual(role.address, activeUser?.address || "") &&
            role.approvalStatus === "INCOMPLETE"
          ) {
            return {
              roleType: role.role,
              roleId: role.id,
              address: role.address,
              willBeComplete: true,
            }
          } else if (role.account?.addressType === "SAFE") {
            const gnosisSafeDetails = await getGnosisSafeDetails(
              role.account.data.chainId || 1,
              role.address
            )

            const totalSafeSignersSigned = signatures.filter((signature) => {
              return gnosisSafeDetails?.signers.some((signer) => {
                return addressesAreEqual(signature.address, signer)
              })
            }).length

            return gnosisSafeDetails?.signers.map((signer) => {
              if (addressesAreEqual(signer, activeUser?.address || "")) {
                return {
                  roleType: role.role,
                  roleId: role.id,
                  address: activeUser.address,
                  willBeComplete: totalSafeSignersSigned == gnosisSafeDetails?.quorum - 1,
                }
              }
            })
          }
        })
      )

      setRoles(signers.flat().filter((a) => a))
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (signatures && activeUser) {
      const hasActiveUserSigned = signatures.some((signature) => {
        return addressesAreEqual(signature.address, activeUser?.address || "")
      })
      if (hasActiveUserSigned) {
        setLoading(false)
      } else if (proposal && activeUser) {
        getRoles(proposal, activeUser)
      }
    }
  }, [proposal, signatures, activeUser])

  return [roles, error, loading] as [RoleType[], any, boolean]
}

export default useGetRolesForProposalApprover
