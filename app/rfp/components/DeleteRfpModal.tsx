import { invalidateQuery, useMutation, useRouter } from "blitz"
import Modal from "app/core/components/Modal"
import getRfpsByTerminalId from "../queries/getRfpsByTerminalId"
import getRfpById from "../queries/getRfpById"
import useStore from "app/core/hooks/useStore"
import deleteRfp from "../mutations/deleteRfp"

export const DeleteRfpModal = ({ isOpen, setIsOpen, rfp, terminalHandle }) => {
  const setToastState = useStore((state) => state.setToastState)
  const router = useRouter()
  const [deleteRfpMutation] = useMutation(deleteRfp, {
    onSuccess: (_data) => {
      invalidateQuery(getRfpsByTerminalId)
      invalidateQuery(getRfpById)
      setIsOpen(false)
      router.push({
        pathname: `/terminal/${terminalHandle}/bulletin`,
        query: { rfpDeleted: true },
      })
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  const handleSubmit = async () => {
    try {
      await deleteRfpMutation({ rfpId: rfp?.id as string })
    } catch (error) {
      console.error("Error deleting RFP", error)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "Error deleting RFPs",
      })
    }
  }
  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <h3 className="text-2xl font-bold pt-6">Deleting RFP?</h3>
        <p className="mt-2">
          Contributors will no longer be able to submit proposals to this RFP. You&apos;ll not be
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
            onClick={() => handleSubmit()}
          >
            Delete RFP
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteRfpModal
