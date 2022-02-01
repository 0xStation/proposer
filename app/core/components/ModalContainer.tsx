import { Fragment } from "react"
import AccountModal from "app/account/components/AccountModal"
import ConnectWalletModal from "app/core/components/ConnectWalletModal"
import useStore from "../hooks/useStore"

const ModalContainer = () => {
  const address = useStore((state) => state.address)
  const walletModalOpen = useStore((state) => state.walletModalOpen)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const accountModalOpen = useStore((state) => state.accountModalOpen)
  const toggleAccountModal = useStore((state) => state.toggleAccountModal)

  return (
    <Fragment>
      <ConnectWalletModal isWalletOpen={walletModalOpen} setIsWalletOpen={toggleWalletModal} />
      {address && (
        <AccountModal isOpen={accountModalOpen} setIsOpen={toggleAccountModal} address={address} />
      )}
    </Fragment>
  )
}

export default ModalContainer
