import { AppProps } from "blitz"
import "app/core/styles/index.css"
import { providers } from "ethers"
import { WagmiConfig, defaultChains, createClient } from "wagmi"
import { MetaMaskConnector } from "wagmi/connectors/metaMask"
import { WalletConnectConnector } from "wagmi/connectors/walletConnect"
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet"

// Chains for connectors to support
const chains = defaultChains

const provider = () => new providers.AlchemyProvider(4, process.env.RINKEBY_API_KEY)
// Set up connectors
const connectors = () => {
  return [
    // MetaMask
    new MetaMaskConnector({ chains }),
    // Wallet Connect
    new WalletConnectConnector({
      options: {
        qrcode: true,
      },
    }),
    // Coinbase
    new CoinbaseWalletConnector({
      options: {
        appName: "Station",
      },
    }),
  ]
}

// Manages wallet connection and state for the wagmi provider
const client = createClient({
  autoConnect: false,
  connectors,
  provider,
})

export default function App({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || ((page) => page)

  return <WagmiConfig client={client}>{getLayout(<Component {...pageProps} />)}</WagmiConfig>
}
