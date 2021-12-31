// import { useMemo } from "react"
import { useEthers } from "@usedapp/core"
// import { users } from "../../core/utils/data"
import Modal from "../../core/components/Modal"

const ConnectWalletModal = ({ isOpen, setIsOpen }) => {
  const { activateBrowserWallet, account } = useEthers()
  const onError = (error: Error) => {
    console.log(error.message)
  }

  return (
    <Modal
      title="Enter Station"
      subtitle="Connect your wallet to enter Station and submit your interest."
      open={isOpen}
      toggle={setIsOpen}
    >
      <div className="mt-8">
        <div className="flex flex-row space-x-3 mx-5 text-marble-white">
          <button
            className="flex-1 border border-marble-white"
            onClick={() => activateBrowserWallet(onError)}
          >
            Metamask
          </button>
          <button
            className="flex-1 border border-marble-white"
            onClick={() => activateBrowserWallet(onError)}
          >
            Wallet Connect
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConnectWalletModal
