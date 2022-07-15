import { invalidateQuery, useMutation } from "blitz"
import Modal from "app/core/components/Modal"
import closeRfp from "app/rfp/mutations/closeRfp"
import getRfpsByTerminalId from "../queries/getRfpsByTerminalId"
import useStore from "app/core/hooks/useStore"
import getRfpById from "../queries/getRfpById"

export const CloseRfpModal = ({ isOpen, setIsOpen, rfp }) => {
  const setToastState = useStore((state) => state.setToastState)
  const [closeRfpMutation] = useMutation(closeRfp, {
    onSuccess: (_data) => {
      invalidateQuery(getRfpsByTerminalId)
      invalidateQuery(getRfpById)
      setIsOpen(false)
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "RFP has been closed. You can reopen it at any time by going to the editor mode.",
      })
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  const handleSubmit = async () => {
    try {
      await closeRfpMutation({ rfpId: rfp?.id })
    } catch (err) {
      console.error(err)
      setIsOpen(false)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "Error closing your RFP.",
      })
    }
  }

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <h3 className="text-2xl font-bold pt-6">Are you sure you want to close the RFP?</h3>
        <p className="mt-2 mr-24">
          Contributors will no longer be able to submit proposals to this RFP. You can reopen it at
          any time.
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
            Close RFP
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default CloseRfpModal
