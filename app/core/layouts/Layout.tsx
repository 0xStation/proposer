import { Head, BlitzLayout, invoke, useSession } from "blitz"
import { useEffect } from "react"
import { useAccount, useDisconnect } from "wagmi"
import Navigation from "../components/Navigation"
import ModalContainer from "../components/ModalContainer"
import ToastContainer from "../components/ToastContainer"
import useStore from "../hooks/useStore"
import logout from "app/session/mutations/logout"

const Layout: BlitzLayout<{ title?: string }> = ({ title, children }) => {
  const session = useSession({ suspense: false })
  const setActiveUser = useStore((state) => state.setActiveUser)
  const { address: connectedAddress } = useAccount()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    // log user out / disconnect them if they
    // programatically disconnect from their wallet extension
    const handleDisconnect = async () => {
      if (session?.siwe?.address && !connectedAddress) {
        setActiveUser(null)
        await invoke(logout, {})
        disconnect()
      }
    }
    handleDisconnect()
  }, [connectedAddress])

  return (
    <>
      <Head>
        <title>{title || "Station"}</title>
        <link rel="icon" href="/station-logo-favicon.ico" />
        <meta name="description" content="Doing work with people who share your mission." />
        <meta name="twitter:site" content="@0xStation" />
        <meta name="twitter:title" content="STATION" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="twitter:description"
          content="Toolkit for digital orgs to curate and reward the best people and projects."
        />
        <link rel="apple-touch-icon" href="/station-logo-favicon.ico" />
      </Head>
      <ModalContainer />
      <ToastContainer />
      <Navigation>{children}</Navigation>
    </>
  )
}

export default Layout
