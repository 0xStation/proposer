import Modal from "./Modal"
import { formatDate } from "app/core/utils/formatDate"
import useDisplayAddress from "../hooks/useDisplayAddress"

const SignerRow = ({ signerAddress, hasSigned, signedAt }) => {
  const { text: signerDisplayAddress } = useDisplayAddress(signerAddress)

  return (
    <>
      <p className="col-span-2 text-sm self-center">{signerDisplayAddress}</p>
      {hasSigned ? (
        <span className="text-sm bg-magic-mint font-bold text-tunnel-black inline-block rounded-full px-2 py-1 w-fit">
          Signed
        </span>
      ) : (
        <span className="text-sm bg-neon-carrot font-bold text-tunnel-black inline-block rounded-full px-2 py-1 w-fit">
          Pending
        </span>
      )}
      <span className="text-sm self-center">{signedAt}</span>
    </>
  )
}

const GnosisSafeSignersModal = ({ isOpen, setIsOpen, role }) => {
  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-6">
        <h2 className="text-2xl font-bold">Signers List</h2>
        <h3 className="mt-2">This is a list of all signers for this Safe.</h3>
        <div className="grid grid-cols-4 mt-4 gap-y-4">
          <span className="col-span-2 text-xs text-light-concrete uppercase font-bold">Signer</span>
          <span className="text-xs text-light-concrete uppercase font-bold">Status</span>
          <span className="text-xs text-light-concrete uppercase font-bold">Date</span>
          {role.account.data.signers.map((signer, idx) => {
            const hasSigned = role.signatures.some((signature) => signature.address === signer)
            const signedAt = formatDate(
              role.signatures.filter((signature) => signature.address === signer)[0]?.timestamp
            )
            return (
              <SignerRow
                signerAddress={signer}
                hasSigned={hasSigned}
                signedAt={signedAt}
                key={`signer-${idx}`}
              />
            )
          })}
        </div>
      </div>
    </Modal>
  )
}

export default GnosisSafeSignersModal
