import { invoke, Image, useParam } from "blitz"
import { trackClick, trackError, initializeUser } from "app/utils/amplitude"
import { TRACKING_EVENTS } from "app/core/utils/constants"
import { METAMASK_ERROR_CODES } from "app/utils/metamaskErrorCodes"
import { SiweMessage } from "siwe"
import { useState } from "react"
import { Spinner } from "app/core/components/Spinner"
import Banner from "/public/walletconnect-banner.png"
import Metamask from "/public/metamask-logo.svg"
import Coinbase from "/public/coinbase-logo.svg"
import WalletConnect from "/public/wallet-logo.svg"
import BackIcon from "/public/back-icon.svg"
import verify from "app/session/mutations/verify"
import generateNonce from "app/session/queries/generateNonce"
import { useAccount, useConnect, useNetwork } from "wagmi"

const {
  FEATURE: { WALLET_CONNECTION },
} = TRACKING_EVENTS

export const ConnectWalletComponent = () => {
  const [connectState, setConnectState] = useState<{
    loading: boolean
    error: boolean
  }>({
    loading: false,
    error: false,
  })
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [showSignView, setShowSignView] = useState<boolean>(false)
  const terminalHandle = useParam("terminalHandle")
  const accountData = useAccount()
  const { connectors, connectAsync, pendingConnector } = useConnect()
  const { chain: activeChain } = useNetwork()
  const [metamaskWallet, walletConnect, coinbaseWallet] = connectors

  const handleWalletConnection = async (connector) => {
    setConnectState({ error: false, loading: true })
    let address = accountData?.address

    if (!address || (accountData?.connector && connector?.id !== accountData?.connector?.id)) {
      try {
        await connectAsync({ connector, chainId: activeChain?.id })
        setConnectState({ error: false, loading: false })
        setShowSignView(true)
      } catch (err) {
        const error = METAMASK_ERROR_CODES[err.code]
        console.error(err)
        const errorMsg = error?.friendlyMessage || error?.message || "Something went wrong"
        setErrorMessage(errorMsg)
        trackError(WALLET_CONNECTION.EVENT_NAME.WALLET_CONNECTION_ERROR, {
          pageName: window.location.href,
          stationHandle: terminalHandle as string,
          errorMsg: err.message,
        })
        setConnectState({ error: true, loading: false })
        return
      }
    } else {
      setConnectState({ error: false, loading: false })
      setShowSignView(true)
    }
  }

  const handleSignInWithEthereum = async () => {
    const address = accountData?.address
    const chainId = activeChain?.id
    trackClick(WALLET_CONNECTION.EVENT_NAME.SIGN_IN_WITH_ETHEREUM_BUTTON_CLICKED, {
      pageName: window.location.href,
      stationHandle: terminalHandle as string,
      userAddress: accountData?.address,
      chainId,
    })
    setConnectState({ error: false, loading: true })

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
        chainId, // chainId is optional
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
        setConnectState({ error: false, loading: true })
      } else {
        throw Error("Unsuccessful signature.")
      }
    } catch (err) {
      console.log(err)
      console.error(err.cause)
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
        stationHandle: terminalHandle as string,
        userAddress: accountData?.address,
        errorMsg,
      })
      setConnectState({ error: true, loading: false })
    }
  }

  return (
    <div
      className={`sm:w-[37rem] rounded bg-tunnel-black border ${
        connectState.error ? "border-torch-red" : "border-concrete"
      }`}
    >
      <div className="w-full h-full relative">
        <Image src={Banner} alt="Modal banner" layout="responsive" />

        {showSignView && accountData?.isConnected ? (
          <>
            <button
              className="h-[20px] w-[20px] absolute mt-2 ml-2"
              onClick={() => {
                setConnectState({ error: false, loading: false })
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
              <button
                className={`bg-electric-violet text-tunnel-black rounded-md content-center hover:opacity-70 cursor:pointer w-36 h-[35px] ${
                  connectState.loading && "cursor-not-allowed"
                }`}
                onClick={handleSignInWithEthereum}
                disabled={connectState.loading}
              >
                {connectState.loading ? (
                  <div className="flex justify-center items-center">
                    <Spinner fill="black" />
                  </div>
                ) : (
                  "Sign"
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-marble-white text-center mt-6">
              {connectState.loading ? "Check your wallet to continue " : "Enter Station"}
            </h1>
            <p className="text-lg text-center mt-4 px-4 sm:px-0">
              Connect your wallet to enter Station.
            </p>
            <p className="text-lg text-center px-4 sm:px-0">
              New to web3? Learn how to create a wallet{" "}
              <a
                className="text-electric-violet"
                href="https://www.youtube.com/watch?v=OsRIHlr0_Iw"
              >
                here
              </a>
              .
            </p>
            {connectState.error ? (
              <div className="mt-2 text-center text-torch-red">
                <p>{errorMessage || "Something went wrong"}</p>
              </div>
            ) : null}
            <div className="flex sm:flex-row flex-col mx-auto text-marble-white my-6 w-full justify-center place-items-center">
              <button
                className={`border border-marble-white rounded-md content-center hover:bg-wet-concrete cursor:pointer w-40 sm:mr-2 h-[35px] ${
                  connectState.loading && "cursor-not-allowed"
                }`}
                disabled={connectState.loading}
                onClick={async () => {
                  trackClick(WALLET_CONNECTION.EVENT_NAME.WALLET_CONNECTION_BUTTON_CLICKED, {
                    pageName: window.location.href,
                    stationHandle: terminalHandle as string,
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
                  <div className="flex flex-row flex-1 justify-center items-center space-x-2 my-1">
                    <p>Metamask</p>
                    <div className="flex flex-2/5 justify-center items-center">
                      <Image src={Metamask} alt="Metamask logo." width={21} height={21} />
                    </div>
                  </div>
                )}
              </button>
              <button
                className={`border border-marble-white rounded-md content-center hover:bg-wet-concrete cursor:pointer w-40 sm:mr-2 sm:mt-0 mt-2 h-[35px] ${
                  connectState.loading && "cursor-not-allowed"
                }`}
                disabled={connectState.loading}
                onClick={async () => {
                  trackClick(WALLET_CONNECTION.EVENT_NAME.WALLET_CONNECTION_BUTTON_CLICKED, {
                    pageName: window.location.href,
                    stationHandle: terminalHandle as string,
                    userAddress: accountData?.address,
                    wallet: "wallet_connection",
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
                    <p>Wallet Connect</p>
                    <div className="flex justify-center items-center">
                      <Image
                        src={WalletConnect}
                        alt="Wallet Connect logo."
                        width={21}
                        height={21}
                      />
                    </div>
                  </div>
                )}
              </button>
              <button
                className={`border border-marble-white rounded-md content-center hover:bg-wet-concrete cursor-pointer w-40 sm:mr-2 sm:mt-0 mt-2 h-[35px] ${
                  connectState.loading && "cursor-not-allowed"
                }`}
                disabled={connectState.loading}
                onClick={async () => {
                  trackClick(WALLET_CONNECTION.EVENT_NAME.WALLET_CONNECTION_BUTTON_CLICKED, {
                    pageName: window.location.href,
                    stationHandle: terminalHandle as string,
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
                    <p>Coinbase</p>
                    <div className="flex justify-center items-center">
                      <Image src={Coinbase} alt="Coinbase logo." width={21} height={21} />
                    </div>
                  </div>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
