import { useEffect, useState } from "react"
import { useEthers } from "@usedapp/core"
import { Image } from "blitz"
import Modal from "../../core/components/Modal"
import Metamask from "/public/metamask-logo.svg"
import Coinbase from "/public/coinbase-logo.svg"
import WalletConnect from "/public/wallet-logo.svg"
import Banner from "/public/walletconnect-banner.svg"

const ConnectWalletModal = ({ isWalletOpen, setIsWalletOpen }) => {
  const [userTriggered, setUserTrigged] = useState(false)
  const { activateBrowserWallet, account } = useEthers()
  const onError = (error: Error) => {
    console.log(error.message)
  }

  // useEffect(() => {
  //   if (account && userTriggered) {
  //     cleanup()
  //   }
  // }, [account])

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
            onClick={() => {
              setUserTrigged(true)
              activateBrowserWallet(onError)
            }}
          >
            <div className="flex flex-row flex-1 justify-center space-x-2 my-1">
              <div className="flex-3/5">
                <span>Metamask</span>
              </div>
              <div className="flex-2/5">
                <Image src={Metamask} alt="Metamask logo." width={21} height={21} />
              </div>
            </div>
          </button>
          <button
            className="flex-1  border border-marble-white rounded-md content-center"
            onClick={() => {
              setUserTrigged(true)
              activateBrowserWallet(onError)
            }}
          >
            <div className="flex flex-row flex-1 justify-center align-middle space-x-2 my-1 mx-auto">
              <div className="flex-3/5">
                <span>Wallet Connect</span>
              </div>
              <div className="flex-2/5">
                <Image src={WalletConnect} alt="Metamask logo." width={19} height={12} />
              </div>
            </div>
          </button>
          <button
            className="flex-1 border border-marble-white rounded-md content-center"
            onClick={() => {
              setUserTrigged(true)
              activateBrowserWallet(onError)
            }}
          >
            <div className="flex flex-row flex-1  justify-center align-middle space-x-2 my-1">
              <div className="flex-3/5">
                <span>Coinbase</span>
              </div>
              <div className="flex-2/5">
                <Image src={Coinbase} alt="Metamask logo." width={16} height={16} />
              </div>
            </div>
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConnectWalletModal
