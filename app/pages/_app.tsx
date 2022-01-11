import { AppProps } from "blitz"
import { Rinkeby, Mainnet, Localhost, DAppProvider, Config } from "@usedapp/core"
import "app/core/styles/index.css"

const config: Config = {
  // supported networks
  networks: [Localhost, Mainnet, Rinkeby],
}

export default function App({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || ((page) => page)

  return <DAppProvider config={config}>{getLayout(<Component {...pageProps} />)}</DAppProvider>
}
