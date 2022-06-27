import { useState } from "react"
import { invalidateQuery, useMutation } from "blitz"
import Modal from "app/core/components/Modal"
import getRfpsByTerminalId from "../queries/getRfpsByTerminalId"
import useStore from "app/core/hooks/useStore"
import getRfpById from "../queries/getRfpById"
import reopenRfp from "../mutations/reopenRfp"
import getShortDate from "app/core/utils/getShortDate"

export const ReopenRfpModal = ({ isOpen, setIsOpen, rfp }) => {
  const [newEndDate, setNewEndDate] = useState<string | undefined>()
  const setToastState = useStore((state) => state.setToastState)
  const [reopenRfpMutation] = useMutation(reopenRfp, {
    onSuccess: (_data) => {
      invalidateQuery(getRfpsByTerminalId)
      invalidateQuery(getRfpById)
      setIsOpen(false)
      setToastState({
        isToastShowing: true,
        type: "success",
        message:
          "Your RFP has been reopened. You can close it anytime by visiting the RFP's information page.",
      })
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  const handleSubmit = async () => {
    try {
      await reopenRfpMutation({
        rfpId: rfp?.id,
        ...((newEndDate && { endDate: new Date(`${newEndDate} 23:59:59 UTC`) }) || {}),
      })
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
        <h3 className="text-2xl font-bold pt-6">Choose an end date</h3>
        <p className="mt-2">
          Select a new end date for your RFP. If this is an ongoing RFP, leave blank. You can close
          an RFP anytime.
        </p>
        <label className="font-bold mt-6 mb-2 block">End date</label>
        <input
          min={getShortDate()}
          type="date"
          className="bg-wet-concrete border border-concrete rounded p-1 mt-1 w-52"
          placeholder="Select date"
          onChange={(e) => {
            setNewEndDate(e.target.value)
          }}
        />
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
            Continue
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ReopenRfpModal
