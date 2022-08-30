import { useMutation, useRouter, invalidateQuery } from "blitz"
import Modal from "app/core/components/Modal"
import useStore from "app/core/hooks/useStore"
import useSignature from "app/core/hooks/useSignature"
import approveProposalNew from "app/proposalNew/mutations/approveProposalNew"
import getProposalNewById from "app/proposalNew/queries/getProposalNewById"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { genProposalNewDigest } from "app/signatures/proposalNew"

export const ApproveProposalNewModal = ({ isOpen, setIsOpen, proposal }) => {
  const router = useRouter()
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const [approveProposalMutation] = useMutation(approveProposalNew)

  let { signMessage } = useSignature()

  const initiateSignature = async () => {
    if (!activeUser || !activeUser?.address) {
      setIsOpen(false)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "You must connect your wallet in order to approve proposals.",
      })
    }

    console.log("pre signature")

    const signature = await signMessage(genProposalNewDigest(proposal))

    // no signature - user must have denied signature
    if (!signature) {
      return
    }

    console.log("post signature")

    try {
      await approveProposalMutation({
        proposalId: proposal?.id,
        signerAddress: activeUser!.address!,
        signature,
      })
      invalidateQuery(getProposalNewById)
      router.replace(router.asPath)
      setIsOpen(false)
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Your approval moves this proposal a step closer to reality.",
      })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <h3 className="text-2xl font-bold pt-6">Sign to confirm approval</h3>
        <p className="mt-2">
          Your approval moves this proposal a step closer to reality. Once this approval has been
          approved by all parties, it will be official!
        </p>

        <div className="mt-8">
          <Button className="mr-2" type={ButtonType.Secondary} onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            isSubmitType={true}
            onClick={() => {
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
