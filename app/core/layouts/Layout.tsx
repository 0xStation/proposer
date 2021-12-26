import { Head, BlitzLayout } from "blitz"
import Ticker from "../components/Ticker"
import Navigation from "../components/Navigation"

const Layout: BlitzLayout<{ title?: string }> = ({ title, children }) => {
  return (
    <>
      <Head>
        <title>{title || "station-web"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation />
      <Ticker />
      {children}
    </>
  )
}

export default Layout
