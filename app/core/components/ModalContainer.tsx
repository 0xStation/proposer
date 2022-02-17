import { Fragment, useMemo } from "react"
import AccountModal from "app/account/components/AccountModal"
import ConnectWalletModal from "app/core/components/ConnectWalletModal"
import useStore from "../hooks/useStore"
import { useAccount } from "wagmi"

const ModalContainer = () => {
  const [{ data: accountData }] = useAccount({
    fetchEns: true,
  })
  const address = useMemo(() => accountData?.address || undefined, [accountData?.address])
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
