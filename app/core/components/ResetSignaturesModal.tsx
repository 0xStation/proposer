import Modal from "app/core/components/Modal"
import Button from "./sds/buttons/Button"

export const ResetSignaturesModal = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}) => {
  return (
    <Modal
      open={isOpen}
      toggle={() => {
        setIsOpen(!isOpen)
      }}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold">Signatures will reset on publish</h1>
        <p className="text-base mt-6">
          Just as a heads up, since you’ve already published this proposal, all other collaborators
          and signers will need to review the new version and re-sign the proposal.
        </p>

        <div className="mt-6 flex justify-end">
          <div className="flex flex-col">
            <Button className="block self-end">Create</Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ResetSignaturesModal
