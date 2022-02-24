import { Suspense } from "react"
import { AppProps } from "blitz"
import "app/core/styles/index.css"
import { providers } from "ethers"
import { Provider, defaultChains } from "wagmi"
import { InjectedConnector } from "wagmi/connectors/injected"
import { WalletConnectConnector } from "wagmi/connectors/walletConnect"
import { WalletLinkConnector } from "wagmi/connectors/walletLink"
import { LOCAL_STORAGE } from "app/core/utils/constants"

// Chains for connectors to support
const chains = defaultChains

const provider = ({ chainId }) => new providers.AlchemyProvider(4, process.env.RINKEBY_API_KEY)

// Set up connectors
const connectors = ({ chainId }) => {
  return [
    // MetaMask
    new InjectedConnector({ chains }),
    // Wallet Connect
    new WalletConnectConnector({
      options: {
        qrcode: true,
      },
    }),
    // Coinbase
    new WalletLinkConnector({
      options: {
        appName: "Station",
      },
    }),
  ]
}
export default function App({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || ((page) => page)

  // https://wagmi-xyz.vercel.app/docs/provider#autoconnect-optional
  // The `wagmi` library provides an autoconnect option that connects
  // a user to whatever their last-used connector was. This maintains
  // the connection throughout the app, but if the user tries to disconnect,
  // wagmi will immediately reinstate the connection. To disconnect the user
  // completely, we're reading from localStorage to read when the user
  // connects and disconnects from the app. We set the localStorage key
  // when the user connects their wallet and remove it on disconnect.
  let autoConnect
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    const connection = localStorage.getItem(LOCAL_STORAGE.CONNECTION)
    autoConnect = !!connection
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Provider
        connectorStorageKey={LOCAL_STORAGE.WAGMI_WALLET}
        connectors={connectors}
        provider={provider}
        autoConnect={autoConnect}
      >
        {getLayout(<Component {...pageProps} />)}
      </Provider>
    </Suspense>
  )
}
