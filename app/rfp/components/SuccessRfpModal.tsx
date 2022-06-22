import { useState } from "react"
import Modal from "app/core/components/Modal"

export const SuccessRfpModal = ({ terminalHandle, isOpen, setIsOpen, rfpId }) => {
  const [isUrlCopied, setIsUrlCopied] = useState<boolean>(false)
  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <h3 className="text-2xl font-bold pt-6">Changes successfully published! </h3>
        <p className="mt-2">
          Copy the link to share with your community and let the waves of ideas carry you to the
          exciting future of Olympus.
        </p>
        <div className="mt-8">
          <button
            type="submit"
            className="bg-electric-violet text-tunnel-black border border-electric-violet py-1 px-4 rounded hover:opacity-75 w-32"
            onClick={() => {
              navigator.clipboard
                .writeText(
                  `https://${window.location.host}/terminal/${terminalHandle}/bulletin/rfp/${rfpId}/info`
                )
                .then(() => {
                  setIsUrlCopied(true)
                  setTimeout(() => setIsUrlCopied(false), 2000)
                })
            }}
          >
            {isUrlCopied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default SuccessRfpModal
