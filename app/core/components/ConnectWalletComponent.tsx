import { invoke, Image } from "blitz"
import { SiweMessage } from "siwe"
import { useEffect, useState } from "react"
import Banner from "/public/walletconnect-banner.svg"
import Metamask from "/public/metamask-logo.svg"
import Coinbase from "/public/coinbase-logo.svg"
import WalletConnect from "/public/wallet-logo.svg"
import verify from "app/session/mutations/verify"
import generateNonce from "app/session/queries/generateNonce"
import { useAccount, useConnect } from "wagmi"

export const ConnectWalletComponent = () => {
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
        throw Error("Unsuccessful signature.")
      }
    } catch (err) {
      console.error(err)
      if (err.code === 4001) {
        setErrorMessage("Wallet signature declined.")
      } else {
        setErrorMessage(`Something went wrong. ${err.message}`)
      }
      setConnectState({ error: true, success: false, loading: false })
    }
  }
  return (
    <div
      className={`w-[612px] rounded bg-tunnel-black border ${
        connectState.error ? "border-torch-red" : "border-concrete"
      } absolute top-1/2 left-1/2 ml-[-306px] mt-[-200px]`}
    >
      <div className="w-full h-full relative">
        <Image src={Banner} alt="Modal banner" layout="responsive" />
      </div>
      <h1 className="text-2xl font-bold text-marble-white text-center mt-6">Enter Station</h1>
      <p className="text-lg text-center mt-4">Connect your wallet to enter Station.</p>
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
      <div className="m-6">
        <div className="flex flex-row space-x-3 mx-5 text-marble-white">
          <button
            className="flex-1 border border-marble-white rounded-md content-center hover:bg-wet-concrete cursor:pointer"
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
            className="flex-1  border border-marble-white rounded-md content-center hover:bg-wet-concrete cursor:pointer"
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
            className="flex-1 border border-marble-white rounded-md content-center hover:bg-wet-concrete cursor-pointer"
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
    </div>
  )
}
