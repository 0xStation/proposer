import Image from "next/image"
import { invoke } from "@blitzjs/rpc"
import { useState, useEffect } from "react"
import { trackClick, trackError, initializeUser } from "app/utils/amplitude"
import { TRACKING_EVENTS } from "app/core/utils/constants"
import { METAMASK_ERROR_CODES } from "app/utils/metamaskErrorCodes"
import Modal from "./Modal"
import { Spinner } from "app/core/components/Spinner"
import Metamask from "/public/metamask-logo.svg"
import Coinbase from "/public/coinbase-logo.svg"
import WalletConnect from "/public/wallet-logo.svg"
import BackIcon from "/public/back-icon.svg"
import Banner from "/public/walletconnect-banner.png"
import { useConnect, useAccount, useNetwork } from "wagmi"
import generateNonce from "app/session/queries/generateNonce"
import { SiweMessage } from "siwe"
import verify from "app/session/mutations/verify"
import Button from "./sds/buttons/Button"

const {
  FEATURE: { WALLET_CONNECTION },
} = TRACKING_EVENTS

// This component takes in a callback which is called after the user
// has successfully connected their wallet / siwe. It can be used for
// actions like showing a new modal after this one has closed, etc.
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
  const [showSignView, setShowSignView] = useState<boolean>(false)
  const accountData = useAccount()
  const { chain: activeChain } = useNetwork()
  const { connectors, connectAsync, data: connectData, pendingConnector } = useConnect()
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
    if (!address || (accountData.connector && connector?.id !== accountData?.connector?.id)) {
      try {
        await connectAsync({ connector, chainId: activeChain?.id })
        setConnectState({ error: false, success: false, loading: false })
        setShowSignView(true)
      } catch (err) {
        const error = METAMASK_ERROR_CODES[err.code]
        console.error(err)
        const errorMsg = error?.friendlyMessage || error?.message || "Something went wrong"
        setErrorMessage(errorMsg)

        trackError(WALLET_CONNECTION.EVENT_NAME.WALLET_CONNECTION_ERROR, {
          pageName: window.location.href,
          errorMsg: err.message,
        })
        setConnectState({ error: true, success: false, loading: false })
        return
      }
    } else {
      setConnectState({ error: false, success: false, loading: false })
      setShowSignView(true)
    }
  }

  const handleSignInWithEthereum = async () => {
    const address = accountData?.address
    const chainId = activeChain?.id

    trackClick(WALLET_CONNECTION.EVENT_NAME.SIGN_IN_WITH_ETHEREUM_BUTTON_CLICKED, {
      pageName: window.location.href,
      userAddress: address,
      chainId,
    })
    setConnectState({ error: false, success: false, loading: true })

    try {
      if (!address) {
        throw Error("Error reading user's address")
      }

      if (!chainId) {
        throw Error("Error reading chain id")
      }

      const nonceRes = await invoke(generateNonce, {})
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in with Ethereum to access your account on Station.",
        uri: window.location.origin,
        version: "1",
        chainId: activeChain?.id, // chainId is optional
        nonce: nonceRes,
      })

      const signer = await accountData?.connector?.getSigner()
      const signature = await signer?.signMessage(message.prepareMessage())
      const verificationSuccessful = await invoke(verify, {
        message: JSON.stringify(message),
        signature,
      })

      if (verificationSuccessful) {
        initializeUser(address)
        setConnectState({ error: false, success: true, loading: false })
      } else {
        throw Error("Unsuccessful signature.")
      }
    } catch (err) {
      console.error("error:", err.message)
      let errorMsg
      if (err.code === 4001) {
        errorMsg = "Signature declined."
        setErrorMessage(errorMsg)
      } else {
        errorMsg = `Something went wrong. ${err.message || ""}`
        setErrorMessage(errorMsg)
      }

      trackError(WALLET_CONNECTION.EVENT_NAME.SIGN_IN_WITH_ETHEREUM_ERROR, {
        pageName: window.location.href,
        errorMsg,
      })

      setConnectState({ error: true, success: false, loading: false })
    }
  }

  return (
    <Modal
      open={isWalletOpen}
      toggle={handleCloseConnectWalletModal}
      banner={Banner}
      showTitle={false}
      error={connectState.error}
    >
      {showSignView && accountData?.isConnected ? (
        <>
          <button
            className="h-[20px] w-[20px] absolute mt-2 ml-2"
            onClick={() => {
              setConnectState({ error: false, success: false, loading: false })
              setShowSignView(false)
            }}
          >
            <Image src={BackIcon} alt="Back icon" />
          </button>
          <h1 className="text-2xl font-bold text-marble-white text-center mt-6 mb-2">
            {connectState.loading ? "Check your wallet to continue " : "Sign in with Ethereum"}
          </h1>
          <p className="text-lg text-center">
            Verify your address so we can securely authenticate you.
          </p>
          {connectState.error ? (
            <div className="mt-2 text-center text-torch-red">
              <p>{errorMessage || "Something went wrong"}</p>
            </div>
          ) : null}
          <div className="m-6 text-center">
            <Button
              onClick={handleSignInWithEthereum}
              isDisabled={connectState.loading}
              isLoading={connectState.loading}
            >
              Sign
            </Button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-marble-white text-center mt-6">
            {connectState.loading ? "Check your wallet to continue " : "Enter Station"}
          </h1>
          <p className="text-lg text-center mt-4">Connect your wallet to enter Station.</p>
          <p className="text-lg text-center">
            New to web3? Learn how to create a wallet{" "}
            <a className="text-electric-violet" href="https://www.youtube.com/watch?v=OsRIHlr0_Iw">
              here
            </a>
            .
          </p>
          {connectState.error ? (
            <div className="mt-2 text-center text-torch-red">
              <p>{errorMessage || "Something went wrong"}</p>
            </div>
          ) : null}
          <div className="m-6">
            <div className="flex sm:flex-row flex-col mx-auto text-marble-white my-6 w-full justify-center place-items-center">
              <button
                className="border border-marble-white rounded-md content-center hover:bg-wet-concrete cursor:pointer w-40 sm:mr-2 sm:mt-0 mt-2 h-[35px]"
                disabled={connectState.loading}
                onClick={async () => {
                  trackClick(WALLET_CONNECTION.EVENT_NAME.WALLET_CONNECTION_BUTTON_CLICKED, {
                    pageName: window.location.href,
                    userAddress: accountData?.address,
                    wallet: "metamask",
                  })
                  await handleWalletConnection(metamaskWallet)
                }}
              >
                {accountData?.isConnecting && metamaskWallet?.id === pendingConnector?.id ? (
                  <div className="flex justify-center items-center">
                    <Spinner fill="white" />
                  </div>
                ) : (
                  <div className="flex flex-row justify-center items-center space-x-2 my-1">
                    <div className="flex-3/5">
                      <span>Metamask</span>
                    </div>
                    <div className="flex flex-2/5 justify-center items-center">
                      <Image src={Metamask} alt="Metamask logo." width={21} height={21} />
                    </div>
                  </div>
                )}
              </button>
              <button
                className="border border-marble-white rounded-md content-center hover:bg-wet-concrete cursor:pointer w-40 sm:mr-2 sm:mt-0 mt-2 h-[35px]"
                disabled={connectState.loading}
                onClick={async () => {
                  trackClick(WALLET_CONNECTION.EVENT_NAME.WALLET_CONNECTION_BUTTON_CLICKED, {
                    pageName: window.location.href,
                    userAddress: accountData?.address,
                    wallet: "wallet_connect",
                  })
                  await handleWalletConnection(walletConnect)
                }}
              >
                {accountData?.isConnecting && walletConnect?.id === pendingConnector?.id ? (
                  <div className="flex justify-center items-center">
                    <Spinner fill="white" />
                  </div>
                ) : (
                  <div className="flex flex-row flex-1 justify-center align-middle items-center space-x-2 my-1 mx-auto">
                    <div className="flex-3/5">
                      <span>Wallet Connect</span>
                    </div>
                    <div className="flex flex-2/5 justify-center items-center">
                      <Image
                        src={WalletConnect}
                        alt="Wallet Connect logo."
                        width={19}
                        height={12}
                      />
                    </div>
                  </div>
                )}
              </button>
              <button
                className="border border-marble-white rounded-md content-center hover:bg-wet-concrete cursor-pointer w-40 sm:mr-2 sm:mt-0 mt-2 h-[35px]"
                disabled={connectState.loading}
                onClick={async () => {
                  trackClick(WALLET_CONNECTION.EVENT_NAME.WALLET_CONNECTION_BUTTON_CLICKED, {
                    pageName: window.location.href,
                    userAddress: accountData?.address,
                    wallet: "coinbase",
                  })
                  await handleWalletConnection(coinbaseWallet)
                }}
              >
                {accountData?.isConnecting && coinbaseWallet?.id === pendingConnector?.id ? (
                  <div className="flex justify-center items-center">
                    <Spinner fill="white" />
                  </div>
                ) : (
                  <div className="flex flex-row flex-1 justify-center items-center align-middle space-x-2 my-1">
                    <div className="flex-3/5">
                      <span>Coinbase</span>
                    </div>
                    <div className="flex flex-2/5 justify-center items-center">
                      <Image src={Coinbase} alt="Coinbase logo." width={16} height={16} />
                    </div>
                  </div>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </Modal>
  )
}

export default ConnectWalletModal
