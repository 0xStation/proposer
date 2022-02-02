import { Head, BlitzLayout } from "blitz"
import Ticker from "../components/Ticker"
import Navigation from "../components/Navigation"
import ModalContainer from "../components/ModalContainer"

const Layout: BlitzLayout<{ title?: string }> = ({ title, children }) => {
  return (
    <>
      <Head>
        <title>{title || "Station"}</title>
        <link rel="icon" href="/station-logo-favicon.ico" />
      </Head>
      <ModalContainer />
      <Navigation />
      <Ticker />
      {children}
    </>
  )
}

export default Layout
