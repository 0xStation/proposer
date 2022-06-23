import Modal from "app/core/components/Modal"

export const DeleteRfpModal = ({ isOpen, setIsOpen, handleSubmit }) => {
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
