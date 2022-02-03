import { Head, BlitzLayout } from "blitz"
import Ticker from "../components/Ticker"
import Navigation from "../components/Navigation"
import ModalContainer from "../components/ModalContainer"
import { useNetwork } from "wagmi"

const Layout: BlitzLayout<{ title?: string }> = ({ title, children }) => {
  const [{ data: chainData }, switchNetwork] = useNetwork()

  return (
    <>
      <Head>
        <title>{title || "Station"}</title>
        <link rel="icon" href="/station-logo-favicon.ico" />
      </Head>
      {chainData?.chain?.id !== undefined && chainData?.chain?.id !== 4 ? (
        <>
          <Navigation />
          <Ticker />
          <div className="flex items-center justify-center min-h-[calc(100vh-15rem)]">
            <div className="text-marble-white text-center">
              <h1 className="text-4xl">Incorrect Network</h1>
              <p className="max-w-lg mt-4">
                Currently, the Station network only supports Rinkby. Please switch your connection
                to the Rinkby chain.
              </p>

              {switchNetwork && (
                <button
                  className="rounded-lg px-2 py-1 mt-4 bg-magic-mint text-tunnel-black"
                  onClick={() => switchNetwork(4)}
                >
                  Switch to Rinkby
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <ModalContainer />
          <Navigation />
          <Ticker />
          {children}
        </>
      )}
    </>
  )
}

export default Layout
