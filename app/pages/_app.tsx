import { AppProps } from "blitz"
import { Rinkeby, Mainnet, Localhost, DAppProvider, Config } from "@usedapp/core"
import "app/core/styles/index.css"
import { useSuppressFirstRenderFlicker } from "app/core/hooks/useSuppressFirstRenderFlicker"

const config: Config = {
  readOnlyChainId: Rinkeby.chainId,
  readOnlyUrls: {
    [Rinkeby.chainId]: "https://eth-rinkeby.alchemyapi.io/v2/ZJIj3ytrFaWioVp550EyzD4MR9q5VClg",
  },
  // supported networks
  networks: [Localhost, Mainnet, Rinkeby],
}

export default function App({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || ((page) => page)

  const suppressRender = useSuppressFirstRenderFlicker()

  if (suppressRender) return null

  return <DAppProvider config={config}>{getLayout(<Component {...pageProps} />)}</DAppProvider>
}
