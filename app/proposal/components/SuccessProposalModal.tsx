import { useState } from "react"
import { Routes } from "blitz"
import Modal from "app/core/components/Modal"
import { genPathFromUrlObject } from "app/utils"

const SuccessProposalModal = ({ terminal, rfpId, proposalId, isOpen, setIsOpen }) => {
  const [isUrlCopied, setIsUrlCopied] = useState<boolean>(false)
  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <h3 className="text-2xl font-bold pt-6">Request successfully published!</h3>
        <p className="mt-2">
          Copy the link to share with your community and let the waves of ideas carry you to the
          exciting future of {terminal.data.name}.
        </p>
        <div className="mt-8">
          <button
            type="button"
            className="bg-electric-violet text-tunnel-black border border-electric-violet py-1 px-4 rounded hover:opacity-75"
            onClick={() => {
              setIsUrlCopied(true)
              navigator.clipboard.writeText(
                genPathFromUrlObject(
                  Routes.ProposalPage({
                    terminalHandle: terminal.handle,
                    rfpId,
                    proposalId,
                  })
                )
              )
            }}
          >
            {isUrlCopied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default SuccessProposalModal
