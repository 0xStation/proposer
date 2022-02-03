import { useState, useEffect } from "react"
import { Head, BlitzLayout } from "blitz"
import Ticker from "../components/Ticker"
import Navigation from "../components/Navigation"
import ModalContainer from "../components/ModalContainer"
import { useAccount } from "wagmi"

const Layout: BlitzLayout<{ title?: string }> = ({ title, children }) => {
  const [chainId, setChainId] = useState<number>()
  const [{ data: accountData }] = useAccount()

  const getChainId = async () => {
    const chainId = await accountData?.connector?.getChainId()
    setChainId(chainId)
  }

  useEffect(() => {
    getChainId()
  }, [accountData])
  return (
    <>
      <Head>
        <title>{title || "Station"}</title>
        <link rel="icon" href="/station-logo-favicon.ico" />
      </Head>
      {chainId !== 4 ? (
        <>
          <Navigation />
          <Ticker />
          <div className="flex items-center justify-center min-h-[calc(100vh-15rem)]">
            <div className="text-marble-white text-center">
              <h1 className="text-4xl">Incorrect Network</h1>
              <p className="max-w-lg mt-2">
                Currently, the Station network only supports Rinkby. Please switch your connection
                to the Rinkby chain.
              </p>
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
