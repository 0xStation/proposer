import { useState } from "react"
import Modal from "./Modal"

const TERMINAL_CREATION = "terminalCreation"
const GENERAL = "general"

const modalContent = {
  general: {
    heading: "Add funds to this Checkbook.",
  },
  terminalCreation: {
    heading: "Terminal created! Next, add funds to Checkbook",
  },
}

export const AddFundsModal = ({
  isOpen,
  setIsOpen,
  checkbookAddress,
  terminalCreationFlow = false,
}) => {
  const [isModalAddressCopied, setIsModalAddressCopied] = useState<boolean>(false)
  const contentKey = terminalCreationFlow ? TERMINAL_CREATION : GENERAL
  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <h3 className="text-2xl font-bold pt-6">{modalContent[contentKey].heading}</h3>
        <p className="mt-2 mr-6">
          To activate your Checkbook, copy the contract address to transfer funds from{" "}
          {
            <a
              href="https://gnosis-safe.io/"
              rel="noopener noreferrer"
              className="text-electric-violet"
              target="_blank"
            >
              Safe
            </a>
          }{" "}
          or other wallet applications.
        </p>
        <div className="mt-8">
          <button
            className="bg-electric-violet text-tunnel-black border border-electric-violet py-1 px-4 rounded hover:opacity-75"
            onClick={() => {
              navigator.clipboard.writeText(checkbookAddress as string).then(() => {
                setIsModalAddressCopied(true)
                setTimeout(() => {
                  setIsOpen(false)
                  // need to set addressCopied to false so if the modal is opened again it does not say copied still
                  // need to put it in a timeout or else it changes while the modal is fading out
                  // not a huge fan of this nested timeout but ig its not too bad. It would be cool if you could fire
                  // a callback once the component (modal in this case) unmounted completely
                  setTimeout(() => {
                    setIsModalAddressCopied(false)
                  }, 200)
                }, 450) // slight delay before closing modal
              })
            }}
          >
            {isModalAddressCopied ? "Copied!" : "Copy address"}
          </button>
        </div>
      </div>
    </Modal>
  )
}