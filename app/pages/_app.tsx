import { AppProps } from "blitz"
import "@rainbow-me/rainbowkit/styles.css"
import { getDefaultWallets, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit"
import trackerInit from "app/utils/amplitude"
import "app/core/styles/index.css"
import { WagmiConfig, defaultChains, createClient, configureChains } from "wagmi"
// import { MetaMaskConnector } from "wagmi/connectors/metaMask"
// import { WalletConnectConnector } from "wagmi/connectors/walletConnect"
// import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet"
import { alchemyProvider } from "wagmi/providers/alchemy"
import { publicProvider } from "wagmi/providers/public"

const { chains, provider } = configureChains(defaultChains, [
  alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY }),
  publicProvider(),
])

// // Set up connectors
// const connectors = () => {
//   return [
//     // MetaMask
//     new MetaMaskConnector({ chains }),
//     // Wallet Connect
//     new WalletConnectConnector({
//       options: {
//         qrcode: true,
//       },
//     }),
//     // Coinbase
//     new CoinbaseWalletConnector({
//       options: {
//         appName: "Station",
//       },
//     }),
//   ]
// }

const { connectors } = getDefaultWallets({
  appName: "Station app",
  chains,
})

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
      <RainbowKitProvider chains={chains} theme={darkTheme()}>
        {getLayout(<Component {...pageProps} />)}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
