import { invalidateQuery, useMutation, useRouter, Routes } from "blitz"
import { trackClick, trackError } from "app/utils/amplitude"
import { TRACKING_EVENTS } from "app/core/utils/constants"
import Modal from "app/core/components/Modal"
import getRfpsByTerminalId from "../queries/getRfpsByTerminalId"
import getRfpById from "../queries/getRfpById"
import useStore from "app/core/hooks/useStore"
import deleteRfp from "../mutations/deleteRfp"

const {
  FEATURE: { RFP },
} = TRACKING_EVENTS

export const DeleteRfpModal = ({
  isOpen,
  setIsOpen,
  rfp,
  terminalHandle,
  pageName,
  terminalId,
}) => {
  const setToastState = useStore((state) => state.setToastState)
  const router = useRouter()
  const [deleteRfpMutation] = useMutation(deleteRfp, {
    onSuccess: (_data) => {
      invalidateQuery(getRfpsByTerminalId)
      invalidateQuery(getRfpById)
      setIsOpen(false)
      router.push(Routes.BulletinPage({ terminalHandle: terminalHandle, rfpDeleted: true }))
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })
  const activeUser = useStore((state) => state.activeUser)

  const handleSubmit = async () => {
    try {
      await deleteRfpMutation({ rfpId: rfp?.id as string })
    } catch (error) {
      console.error("Error deleting project", error)
      trackError(RFP.EVENT_NAME.ERROR_DELETING_RFP, {
        pageName,
        userAddress: activeUser?.address,
        stationHandle: terminalHandle as string,
        stationId: terminalId,
        rfpId: rfp?.id,
        errorMsg: error.message,
      })
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "Error deleting project.",
      })
    }
  }
  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <h3 className="text-2xl font-bold pt-6">Are you sure you want to delete the project?</h3>
        <p className="mt-2">
          Contributors will no longer be able to submit proposals to this project. You won&apos;t be
          able to undo this action.
        </p>
        <div className="mt-8">
          <button
            type="button"
            className="text-electric-violet border border-electric-violet mr-2 py-1 px-4 rounded hover:opacity-75"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-electric-violet text-tunnel-black border border-electric-violet py-1 px-4 rounded hover:opacity-75"
            onClick={() => {
              trackClick(RFP.EVENT_NAME.DELETE_RFP_CLICKED, {
                pageName,
                userAddress: activeUser?.address,
                stationHandle: terminalHandle as string,
                stationId: terminalId,
                rfpId: rfp?.id,
              })
              handleSubmit()
            }}
          >
            Delete project
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteRfpModal
