import { AppProps } from "blitz"
import { Rinkeby, DAppProvider, Config } from "@usedapp/core"
import "app/core/styles/index.css"

const config: Config = {
  // readOnlyChainId: Rinkeby.chainId,
  // readOnlyUrls: {
  //   [Rinkeby.chainId]: "https://eth-rinkeby.alchemyapi.io/v2/ZJIj3ytrFaWioVp550EyzD4MR9q5VClg",
  // },
}

export default function App({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || ((page) => page)

  return <DAppProvider config={config}>{getLayout(<Component {...pageProps} />)}</DAppProvider>
}
