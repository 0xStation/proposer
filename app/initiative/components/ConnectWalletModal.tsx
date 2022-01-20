import { useEffect } from "react"
import { Image } from "blitz"
import Modal from "../../core/components/Modal"
import Metamask from "/public/metamask-logo.svg"
import Coinbase from "/public/coinbase-logo.svg"
import WalletConnect from "/public/wallet-logo.svg"
import Banner from "/public/walletconnect-banner.svg"
import { useAccount, useConnect } from "wagmi"

const ConnectWalletModal = ({ isWalletOpen, setIsWalletOpen }) => {
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  })

  const [{ data: connectData, error: connectError, loading }, connect] = useConnect()

  // https://github.com/NoahZinsmeister/web3-react/issues/300
  // If a user is connecting their wallet for the first time and has both coinbase and metamask extensions,
  // both wallets will be triggered at the same time when trying to connect either of the wallets.
  // The multi-wallet triggering is attributed to the window.ethereum obj providing support
  // for both metamask and coinbase at the same time via a multi-provider. The mult-provider contains a list of
  // the different provdiers - whichever wallet is connected first will be the selected provider.
  // Connecting to the second wallet will not update the selected provider.
  // The reason for this design choice was so that dapps wouldn't have to worry about updating states when
  // the user decides to connect the other wallet.
  const activateInjectedProvider = (providerName: "metamask" | "coinbase") => {
    const { ethereum } = window

    // @ts-ignore
    if (!ethereum?.providers) {
      console.log("ethereum is undefined")
      return false
    }
    const providerLookupMap = {
      // @ts-ignore
      coinbase: ethereum.providers.find(({ isCoinbaseWallet }) => isCoinbaseWallet),
      // @ts-ignore
      metamask: ethereum.providers.find(({ isMetaMask }) => isMetaMask),
    }

    const provider = providerLookupMap[providerName]

    if (provider) {
      // @ts-ignore
      ethereum.setSelectedProvider(provider)
      return true
    }
    return false
  }

  return (
    <Modal
      title="Enter Station"
      subtitle="Connect your wallet to enter Station and submit your interest."
      open={isWalletOpen}
      toggle={setIsWalletOpen}
      banner={Banner}
    >
      <div className="mt-8">
        <div className="flex flex-row space-x-3 mx-5 text-marble-white">
          <button
            className="flex-1 border border-marble-white  rounded-md content-center"
            onClick={async () => {
              activateInjectedProvider("metamask")
              // @ts-ignore
              await connect(connectData?.connectors[0])
            }}
          >
            <div className="flex flex-row flex-1 justify-center items-center space-x-2 my-1">
              <div className="flex-3/5">
                <span>Metamask</span>
              </div>
              <div className="flex flex-2/5 justify-center items-center">
                <Image src={Metamask} alt="Metamask logo." width={21} height={21} />
              </div>
            </div>
          </button>
          <button
            className="flex-1  border border-marble-white rounded-md content-center"
            onClick={async () => {
              // @ts-ignore
              await connect(connectData?.connectors[1])
            }}
          >
            <div className="flex flex-row flex-1 justify-center align-middle items-center space-x-2 my-1 mx-auto">
              <div className="flex-3/5">
                <span>Wallet Connect</span>
              </div>
              <div className="flex flex-2/5 justify-center items-center">
                <Image src={WalletConnect} alt="Wallet Connect logo." width={19} height={12} />
              </div>
            </div>
          </button>
          <button
            className="flex-1 border border-marble-white rounded-md content-center"
            onClick={async () => {
              activateInjectedProvider("coinbase")
              // @ts-ignore
              await connect(connectData?.connectors[2])
            }}
          >
            <div className="flex flex-row flex-1 justify-center items-center align-middle space-x-2 my-1">
              <div className="flex-3/5">
                <span>Coinbase</span>
              </div>
              <div className="flex flex-2/5 justify-center items-center">
                <Image src={Coinbase} alt="Coinbase logo." width={16} height={16} />
              </div>
            </div>
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConnectWalletModal
