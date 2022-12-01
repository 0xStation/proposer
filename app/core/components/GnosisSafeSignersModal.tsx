import Modal from "./Modal"
import truncateString from "app/core/utils/truncateString"
import { formatDate } from "app/core/utils/formatDate"

const GnosisSafeSignersModal = ({ isOpen, setIsOpen, participant }) => {
  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-6">
        <h2 className="text-2xl font-bold">Signers List</h2>
        <h3 className="mt-2">This is a list of all signers for this Safe.</h3>
        <div className="grid grid-cols-3 mt-4 gap-y-4">
          <span className="text-xs text-light-concrete uppercase font-bold">Signer</span>
          <span className="text-xs text-light-concrete uppercase font-bold">Status</span>
          <span className="text-xs text-light-concrete uppercase font-bold">Date</span>
          {participant?.account?.data?.signers?.map((signer, idx) => {
            return (
              <>
                <p key={`signer-${idx}`} className="text-sm self-center">
                  {truncateString(signer)}
                </p>
                {participant?.signatures?.some((signature) => signature.address === signer) ? (
                  <span className="text-sm bg-magic-mint font-bold text-tunnel-black inline-block rounded-full px-2 py-1 w-fit">
                    Signed
                  </span>
                ) : (
                  <span className="text-sm bg-neon-carrot font-bold text-tunnel-black inline-block rounded-full px-2 py-1 w-fit">
                    Pending
                  </span>
                )}
                <span className="text-sm self-center">
                  {formatDate(
                    participant?.signatures?.filter((signature) => signature.address === signer)[0]
                      ?.timestamp
                  )}
                </span>
              </>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}

export default GnosisSafeSignersModal
