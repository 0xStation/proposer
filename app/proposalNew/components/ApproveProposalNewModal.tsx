import { useMutation, useRouter, invalidateQuery } from "blitz"
import { useState } from "react"
import Modal from "app/core/components/Modal"
import useStore from "app/core/hooks/useStore"
import useSignature from "app/core/hooks/useSignature"
import approveProposalNew from "app/proposalNew/mutations/approveProposalNew"
import getProposalNewSignaturesById from "app/proposalNew/queries/getProposalNewSignaturesById"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { genProposalNewDigest } from "app/signatures/proposalNew"
import getProposalNewById from "../queries/getProposalNewById"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { ProposalNew } from "app/proposalNew/types"

export const ApproveProposalNewModal = ({
  isOpen,
  setIsOpen,
  proposal,
  additionalRoles,
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

    const message = genProposalNewDigest(proposal)
    const signature = await signMessage(message)

    // no signature - user must have denied signature
    if (!signature) {
      setIsLoading(false)
      return
    }

    const implicitRoles =
      proposal?.roles
        ?.filter((role) => addressesAreEqual(role.address, activeUser?.address!))
        ?.map((role) => {
          return { roleId: role.id, complete: true }
        }) || []
    const representingRoles = additionalRoles
      ? implicitRoles.concat(additionalRoles)
      : implicitRoles

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
            isDisabled={isLoading}
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
