import Modal from "./Modal"
import truncateString from "app/core/utils/truncateString"

const GnosisSafeSignersModal = ({ isOpen, setIsOpen, signers }) => {
  console.log(signers)
  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-6">
        <h2 className="text-2xl font-bold">Signers List</h2>
        <h3 className="mt-2">This is a list of all signers for this Safe.</h3>
        <div className="grid grid-cols-3 mt-4 gap-y-4">
          <span className="text-xs text-light-concrete uppercase font-bold">Signer</span>
          <span className="text-xs text-light-concrete uppercase font-bold">Status</span>
          <span className="text-xs text-light-concrete uppercase font-bold">Date</span>
          {signers.map((signer, idx) => {
            return (
              <>
                <p key={`signer-${idx}`} className="text-sm">
                  {truncateString(signer)}
                </p>
                <span></span>
                <span></span>
              </>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}

export default GnosisSafeSignersModal
