import { useMutation, useRouter, invalidateQuery, useQuery } from "blitz"
import { useState } from "react"
import Modal from "app/core/components/Modal"
import useStore from "app/core/hooks/useStore"
import useSignature from "app/core/hooks/useSignature"
import approveProposalNew from "app/proposalNew/mutations/approveProposalNew"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import getProposalNewById from "../queries/getProposalNewById"
import { genProposalNewApprovalDigest } from "app/signatures/proposalSignature"
import { ProposalNew } from "app/proposalNew/types"
import useGetUsersRemainingRolesToSignFor from "app/core/hooks/useGetUsersRemainingRolesToSignFor"
import getProposalNewSignaturesById from "app/proposalNew/queries/getProposalNewSignaturesById"

export const ApproveProposalNewModal = ({
  isOpen,
  setIsOpen,
  proposal,
}: {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  proposal: ProposalNew
  additionalRoles?: { roleId: string; complete: boolean }[]
}) => {
  const router = useRouter()
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const [approveProposalMutation] = useMutation(approveProposalNew)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [signatures] = useQuery(
    getProposalNewSignaturesById,
    { proposalId: proposal.id },
    {
      suspense: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled: !!proposal.id,
    }
  )

  const [remainingRoles, _error, getRolesIsLoading] = useGetUsersRemainingRolesToSignFor(
    proposal,
    signatures
  )

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

    const message = genProposalNewApprovalDigest({
      signerAddress: activeUser?.address,
      proposalHash: proposal?.data?.ipfsMetadata?.hash,
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
      invalidateQuery(getProposalNewSignaturesById)
      // invalidate proposal query to get ipfs hash post-approval
      // since an ipfs has is created on proposal approval
      invalidateQuery(getProposalNewById)
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

export default ApproveProposalNewModal
