import { invalidateQuery, useMutation } from "blitz"
import { trackClick, trackError } from "app/utils/amplitude"
import { TRACKING_EVENTS } from "app/core/utils/constants"
import Modal from "app/core/components/Modal"
import closeRfp from "app/rfp/mutations/closeRfp"
import getRfpsByTerminalId from "../queries/getRfpsByTerminalId"
import useStore from "app/core/hooks/useStore"
import getRfpById from "../queries/getRfpById"
import Button from "app/core/components/sds/buttons/Button"
import { ButtonType } from "app/core/components/sds/buttons/Button"

const {
  FEATURE: { RFP },
} = TRACKING_EVENTS

export const CloseRfpModal = ({ isOpen, setIsOpen, rfp, pageName, terminalId, terminalHandle }) => {
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
      trackClick(RFP.EVENT_NAME.CLOSE_RFP_CLICKED, {
        pageName,
        stationHandle: terminalHandle as string,
        stationId: terminalId,
        rfpId: rfp?.id,
      })
      await closeRfpMutation({ rfpId: rfp?.id })
    } catch (err) {
      console.error(err)
      trackError(RFP.EVENT_NAME.ERROR_CLOSING_RFP, {
        pageName,
        stationHandle: terminalHandle as string,
        stationId: terminalId,
        rfpId: rfp?.id,
        errorMsg: err.message,
      })
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
          <Button type={ButtonType.Secondary} onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button isSubmitType={true} onClick={() => handleSubmit()}>
            Close RFP
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default CloseRfpModal
