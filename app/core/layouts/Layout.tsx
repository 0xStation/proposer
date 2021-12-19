import { Head, BlitzLayout } from "blitz"
import Ticker from "../components/Ticker"
import Navigation from "../components/Navigation"

const Layout: BlitzLayout<{ title?: string; user: { handle: string } }> = ({
  title,
  user,
  children,
}) => {
  return (
    <>
      <Head>
        <title>{title || "station-web"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation user={user} />
      <Ticker />
      {children}
    </>
  )
}

export default Layout
