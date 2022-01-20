import { AppProps } from "blitz"
import "app/core/styles/index.css"
import { providers } from "ethers"
import { Provider, chain, defaultChains, developmentChains } from "wagmi"
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
    new WalletConnectConnector({
      options: {
        qrcode: true,
      },
    }),
    // Coinbase
    new WalletLinkConnector({
      options: {
        appName: "Station",
        // jsonRpcUrl: "https://eth-rinkeby.alchemyapi.io/v2/ZJIj3ytrFaWioVp550EyzD4MR9q5VClg",
      },
    }),
  ]
}
export default function App({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || ((page) => page)

  // const suppressRender = useSuppressFirstRenderFlicker()

  // if (suppressRender) return null

  return (
    <Provider autoConnect connectors={connectors} provider={provider}>
      {getLayout(<Component {...pageProps} />)}
    </Provider>
  )
}
