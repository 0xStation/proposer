import { AppProps, Script } from "blitz"
import trackerInit from "app/utils/amplitude"
import "app/core/styles/index.css"
import { WagmiConfig, createClient, configureChains, allChains } from "wagmi"
import { MetaMaskConnector } from "wagmi/connectors/metaMask"
import { WalletConnectConnector } from "wagmi/connectors/walletConnect"
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet"
import { alchemyProvider } from "wagmi/providers/alchemy"
import { publicProvider } from "wagmi/providers/public"

const { chains, provider } = configureChains(
  [...allChains],
  [alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY }), publicProvider()]
)

// // Set up connectors
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

const client = createClient({
  autoConnect: true,
  connectors,
  provider,
})

trackerInit()

export default function App({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || ((page) => page)

  return (
    <WagmiConfig client={client}>
      <Script
        strategy="beforeInteractive"
        src="https://merlin-app.github.io/merlin-sessions-jsmodule/public/js/merlin.js"
        onLoad={() => {
          if (
            // @ts-ignore
            merlin &&
            process.env.NEXT_PUBLIC_MERLIN_TENANT_NAME &&
            process.env.NEXT_PUBLIC_MERLIN_API_KEY
          ) {
            // @ts-ignore
            merlin.init({
              tenant_name: process.env.NEXT_PUBLIC_MERLIN_TENANT_NAME,
              api_key: process.env.NEXT_PUBLIC_MERLIN_API_KEY,
              user_id: 1,
              wallet_address: "0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13",
              environment_type: "dev",
            })
          }
        }}
      />
      {getLayout(<Component {...pageProps} />)}
    </WagmiConfig>
  )
}
