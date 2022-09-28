import { useMutation, useRouter, invalidateQuery, useQuery } from "blitz"
import { useState } from "react"
import Modal from "app/core/components/Modal"
import useStore from "app/core/hooks/useStore"
import useSignature from "app/core/hooks/useSignature"
import approveProposal from "app/proposal/mutations/approveProposal"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import getProposalById from "../queries/getProposalById"
import { genProposalApprovalDigest } from "app/signatures/proposalSignature"
import { Proposal } from "app/proposal/types"
import useGetUsersRolesToSignFor from "app/core/hooks/useGetUsersRolesToSignFor"
import getProposalSignaturesById from "app/proposal/queries/getProposalSignaturesById"
import { genProposalDigest } from "app/signatures/proposal"
import { getHash } from "app/signatures/utils"

export const ApproveProposalModal = ({
  isOpen,
  setIsOpen,
  proposal,
}: {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  proposal: Proposal
  additionalRoles?: { roleId: string; complete: boolean }[]
}) => {
  const router = useRouter()
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const [approveProposalMutation] = useMutation(approveProposal)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [remainingRoles, _signedRoles, _error, getRolesIsLoading] =
    useGetUsersRolesToSignFor(proposal)

  const { signMessage } = useSignature()

  const initiateSignature = async () => {
    if (!activeUser || !activeUser?.address) {
      setIsOpen(false)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "You must connect your wallet.",
      })
    }

    const { domain, types, value } = genProposalDigest(proposal)
    const proposalHash = getHash(domain, types, value)

    const message = genProposalApprovalDigest({
      signerAddress: activeUser?.address,
      proposalHash: proposalHash,
      proposalId: proposal?.id as string,
    })
    const signature = await signMessage(message)

    // no signature - user must have denied signature
    if (!signature) {
      setIsLoading(false)
      return
    }

    const representingRoles = remainingRoles.map((role) => {
      return {
        roleId: role.roleId,
        complete: role.oneSignerNeededToComplete,
      }
    })

    try {
      await approveProposalMutation({
        proposalId: proposal?.id,
        signerAddress: activeUser!.address!,
        message,
        signature,
        representingRoles,
      })
      invalidateQuery(getProposalSignaturesById)
      // invalidate proposal query to get ipfs hash post-approval
      // since an ipfs has is created on proposal approval
      invalidateQuery(getProposalById)
      router.replace(router.asPath)
      setIsOpen(false)
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Your signature has been saved.",
      })
    } catch (e) {
      console.error(e)
    }

    setIsLoading(false)
  }

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <h3 className="text-2xl font-bold pt-6">Sign to affirm</h3>
        <p className="mt-2">
          Your signature moves this proposal closer to agreement. Once this approval has been signed
          by all parties, its terms will be official and uploaded to decentralized storage!
        </p>

        <div className="mt-8 flex items-center">
          <Button
            className="mr-2"
            type={ButtonType.Secondary}
            onClick={() => {
              setIsLoading(false)
              setIsOpen(false)
            }}
          >
            Cancel
          </Button>
          <Button
            isSubmitType={true}
            isLoading={isLoading}
            isDisabled={isLoading || getRolesIsLoading}
            onClick={() => {
              setIsLoading(true)
              initiateSignature()
            }}
          >
            Sign
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ApproveProposalModal
