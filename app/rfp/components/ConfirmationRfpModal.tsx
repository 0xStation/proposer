import Modal from "app/core/components/Modal"

export const ConfirmationRfpModal = ({ isOpen, setIsOpen, handleSubmit }) => {
  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <h3 className="text-2xl font-bold pt-6">Publishing RFP</h3>
        <p className="mt-2 mr-24">
          Contributors will be able to submit proposals after the open date. You can edit your RFP
          at any time.
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
            Continue
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmationRfpModal
