import { useState, useEffect } from "react"
import { Image, invoke } from "blitz"
import Modal from "./Modal"
import Metamask from "/public/metamask-logo.svg"
import Coinbase from "/public/coinbase-logo.svg"
import WalletConnect from "/public/wallet-logo.svg"
import Banner from "/public/walletconnect-banner.svg"
import { useConnect, useAccount } from "wagmi"
import generateNonce from "app/session/queries/generateNonce"
import { SiweMessage } from "siwe"
import verify from "app/session/mutations/verify"

const ConnectWalletModal = ({ isWalletOpen, setIsWalletOpen }) => {
  const [connectState, setConnectState] = useState<{
    loading: boolean
    success: boolean
    error: boolean
  }>({
    loading: false,
    success: false,
    error: false,
  })
  const [errorMessage, setErrorMessage] = useState<string>("")
  const { data: accountData } = useAccount()
  const { connectors, connectAsync, data: connectData } = useConnect()
  const [metamaskWallet, walletConnect, coinbaseWallet] = connectors

  const handleCloseConnectWalletModal = () => {
    setConnectState({ error: false, success: false, loading: false })
    setErrorMessage("")
    setIsWalletOpen(false)
  }

  useEffect(() => {
    if (connectState.success) {
      handleCloseConnectWalletModal()
    }
  }, [connectState.success])

  const handleWalletConnection = async (connector) => {
    setConnectState({ error: false, success: false, loading: true })
    let address = accountData?.address
    let chainId = connectData?.chain.id
    if (!address) {
      try {
        const connectData = await connectAsync(connector)
        address = connectData.account
        chainId = connectData.chain.id
      } catch (err) {
        if (err.code === 4001) {
          setErrorMessage("Wallet signature declined.")
        } else {
          setErrorMessage("Something went wrong.")
        }
        setConnectState({ error: true, success: false, loading: false })
      }
    }

    try {
      const nonceRes = await invoke(generateNonce, {})
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in with Ethereum to access your account on Station.",
        uri: window.location.origin,
        version: "1",
        chainId, // chainId is optional
        nonce: nonceRes,
      })

      const signer = await metamaskWallet?.getSigner()
      const signature = await signer?.signMessage(message.prepareMessage())
      const verificationSuccessful = await invoke(verify, {
        message: JSON.stringify(message),
        signature,
      })

      if (verificationSuccessful) {
        setConnectState({ error: false, success: true, loading: false })
      } else {
        throw Error("Unsuccessful signature")
      }
    } catch (err) {
      if (err.code === 4001) {
        setErrorMessage("Wallet signature declined.")
      } else {
        setErrorMessage("Something went wrong.")
      }
      setConnectState({ error: true, success: false, loading: false })
    }
  }

  return (
    <Modal
      title="Enter Station"
      open={isWalletOpen}
      toggle={handleCloseConnectWalletModal}
      banner={Banner}
      showTitle={true}
    >
      <p className="text-lg text-center mt-4">
        Connect your wallet to enter Station and explore initiatives.
      </p>
      <p className="text-lg text-center">
        New to web3? Learn how to create a wallet{" "}
        <a className="text-magic-mint" href="https://www.youtube.com/watch?v=OsRIHlr0_Iw">
          here
        </a>
        .
      </p>
      {connectState.error ? (
        <div className="mt-2 text-center text-torch-red">
          <p>{errorMessage || "Something went wrong"}</p>
        </div>
      ) : null}
      <div className="mt-6">
        <div className="flex flex-row space-x-3 mx-5 text-marble-white">
          <button
            className="flex-1 border border-marble-white rounded-md content-center hover:bg-wet-concrete"
            disabled={connectState.loading}
            onClick={async () => {
              await handleWalletConnection(metamaskWallet)
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
            className="flex-1  border border-marble-white rounded-md content-center hover:bg-wet-concrete"
            disabled={connectState.loading}
            onClick={async () => {
              await handleWalletConnection(walletConnect)
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
            className="flex-1 border border-marble-white rounded-md content-center hover:bg-wet-concrete"
            disabled={connectState.loading}
            onClick={async () => {
              await handleWalletConnection(coinbaseWallet)
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
