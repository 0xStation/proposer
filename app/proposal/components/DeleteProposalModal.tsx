import { useMutation, useRouter, Routes } from "blitz"
import { trackClick, trackError } from "app/utils/amplitude"
import { TRACKING_EVENTS } from "app/core/utils/constants"
import Modal from "app/core/components/Modal"
import useStore from "app/core/hooks/useStore"
import deleteProposal from "../mutations/deleteProposal"
import Button from "app/core/components/sds/buttons/Button"
import { ButtonType } from "app/core/components/sds/buttons/Button"

const {
  FEATURE: { PROPOSAL },
} = TRACKING_EVENTS

export const DeleteProposalModal = ({
  isOpen,
  setIsOpen,
  proposal,
  terminalHandle,
  pageName,
  terminalId,
}) => {
  const setToastState = useStore((state) => state.setToastState)
  const router = useRouter()
  const [deleteProposalMutation] = useMutation(deleteProposal, {
    onSuccess: (_data) => {
      setIsOpen(false)
      router.push(
        Routes.ProposalsTab({
          terminalHandle: terminalHandle,
          rfpId: proposal.rfpId,
          proposalDeleted: true,
        })
      )
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })
  const activeUser = useStore((state) => state.activeUser)

  const handleSubmit = async () => {
    try {
      await deleteProposalMutation({ proposalId: proposal?.id as string })
    } catch (error) {
      console.error("Error deleting proposal", error)
      trackError(PROPOSAL.EVENT_NAME.ERROR_DELETING_PROPOSAL, {
        pageName,
        userAddress: activeUser?.address,
        stationHandle: terminalHandle as string,
        stationId: terminalId,
        proposalId: proposal?.id,
        errorMsg: error.message,
      })
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "Error deleting proposal",
      })
    }
  }
  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <h3 className="text-2xl font-bold pt-6">Deleting proposal?</h3>
        <p className="mt-2">
          Reviewers will no longer be able to review and fund this proposal. You&apos;ll not be able
          to undo this action.
        </p>
        <div className="mt-8">
          <Button type={ButtonType.Secondary} onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            isSubmitType={true}
            onClick={() => {
              trackClick(PROPOSAL.EVENT_NAME.DELETE_PROPOSAL_CLICKED, {
                pageName,
                userAddress: activeUser?.address,
                stationHandle: terminalHandle as string,
                stationId: terminalId,
                proposalId: proposal?.id,
              })
              handleSubmit()
            }}
          >
            Delete proposal
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteProposalModal
