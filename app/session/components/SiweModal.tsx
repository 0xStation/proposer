import Modal from "app/core/components/Modal"
export const SiweModal = ({ isOpen, setIsOpen }) => {
  return (
    <Modal title="Sign in with Ethereum" open={isOpen} toggle={setIsOpen} showTitle={true}>
      <p className="text-lg text-center mt-4">
        Authorize your account to perform actions on Station.
      </p>
      <div className="mt-10 text-center">
        <button className="mx-auto border text-tunnel-black rounded px-20 py-1 bg-magic-mint">
          Sign
        </button>
      </div>
      <p className="text-base text-center mt-3">
        Just browsing? Sign later by going to your profile navigation.
      </p>
    </Modal>
  )
}

export default SiweModal
