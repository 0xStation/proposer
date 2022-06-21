import { AppProps } from "blitz"
import "app/core/styles/index.css"
import { WagmiConfig, createClient, configureChains } from "wagmi"
import { MetaMaskConnector } from "wagmi/connectors/metaMask"
import { WalletConnectConnector } from "wagmi/connectors/walletConnect"
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet"
import { publicProvider } from "wagmi/providers/public"
import { alchemyProvider } from "wagmi/providers/alchemy"
import { mainnet, rinkeby, localhost } from "wagmi/chains"

// Chains for connectors to support
const { chains, provider } = configureChains(
  [mainnet, rinkeby, localhost], // add more chains here as we deploy to new networks
  [
    alchemyProvider({ alchemyId: process.env.BLITZ_PUBLIC_ALCHEMY_API_KEY as string }),
    publicProvider(), // gives fallback provider for Localhost network
  ]
)

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
