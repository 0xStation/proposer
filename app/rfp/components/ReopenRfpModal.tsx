import { useState } from "react"
import { invalidateQuery, useMutation } from "blitz"
import { track } from "@amplitude/analytics-browser"
import { trackClick, trackError } from "app/utils/amplitude"
import { TRACKING_EVENTS } from "app/core/utils/constants"
import Modal from "app/core/components/Modal"
import getRfpsByTerminalId from "../queries/getRfpsByTerminalId"
import useStore from "app/core/hooks/useStore"
import getRfpById from "../queries/getRfpById"
import reopenRfp from "../mutations/reopenRfp"
import getShortDate from "app/core/utils/getShortDate"

const {
  FEATURE: { RFP },
} = TRACKING_EVENTS

export const ReopenRfpModal = ({
  isOpen,
  setIsOpen,
  rfp,
  pageName,
  terminalId,
  terminalHandle,
}) => {
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
          "Project has been reopened. You can close it anytime by visiting the project's information page.",
      })
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  const handleSubmit = async () => {
    try {
      trackClick(RFP.EVENT_NAME.REOPEN_RFP_CLICKED, {
        pageName,
        stationHandle: terminalHandle as string,
        stationId: terminalId,
        rfpId: rfp?.id,
        endDate: newEndDate,
      })
      await reopenRfpMutation({
        rfpId: rfp?.id,
        ...((newEndDate && { endDate: new Date(`${newEndDate} 23:59:59 UTC`) }) || {
          endDate: undefined,
        }),
      })
    } catch (err) {
      trackError(RFP.EVENT_NAME.ERROR_REOPENING_RFP, {
        pageName,
        stationHandle: terminalHandle as string,
        stationId: terminalId,
        rfpId: rfp?.id,
        errorMsg: err.message,
      })
      console.error(err)
      setIsOpen(false)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "Error closing your project.",
      })
    }
  }

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <h3 className="text-2xl font-bold pt-6">Select a closing date</h3>
        <p className="mt-2">
          Set a deadline for project submissions. If this is an ongoing project, leave it blank. You
          can close a project at any time.
        </p>
        <input
          min={getShortDate()}
          type="date"
          className="bg-wet-concrete border border-concrete rounded p-1 mt-6 w-52"
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
