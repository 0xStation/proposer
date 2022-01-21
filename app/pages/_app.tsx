import { AppProps } from "blitz"
import "app/core/styles/index.css"
import { providers } from "ethers"
import { Provider, chain, defaultChains } from "wagmi"
import { InjectedConnector } from "wagmi/connectors/injected"
import { WalletConnectConnector } from "wagmi/connectors/walletConnect"
import { WalletLinkConnector } from "wagmi/connectors/walletLink"

// Chains for connectors to support
const chains = defaultChains

const provider = ({ chainId }) => new providers.AlchemyProvider(4, process.env.RINKEBY_API_KEY)

// Set up connectors
const connectors = ({ chainId }) => {
  const rpcUrl = chains.find((x) => x.id === chainId)?.rpcUrls?.[0] ?? chain.mainnet.rpcUrls[0]
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

  return (
    <Provider connectors={connectors} provider={provider}>
      {getLayout(<Component {...pageProps} />)}
    </Provider>
  )
}
