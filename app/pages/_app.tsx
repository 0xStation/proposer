import { AppProps } from "blitz"
import "app/core/styles/index.css"
import { providers } from "ethers"
import { WagmiProvider, defaultChains, createClient } from "wagmi"
import { InjectedConnector } from "wagmi/connectors/injected"
import { WalletConnectConnector } from "wagmi/connectors/walletConnect"
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet"
import { requireEnv } from "app/utils/requireEnv"

// Chains for connectors to support
const chains = defaultChains

const provider = ({ chainId }) => new providers.AlchemyProvider(4, requireEnv("RINKEBY_API_KEY"))

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

  return <WagmiProvider client={client}>{getLayout(<Component {...pageProps} />)}</WagmiProvider>
}
