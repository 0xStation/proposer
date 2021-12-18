import { Head, BlitzLayout } from "blitz"
import { Image } from "blitz"
import Ticker from "../components/Ticker"
import Dropdown from "../components/Dropdown"
import logo from "../../../public/station_logo.svg"
import SoundIcon from "../icons/soundIcon"

const Layout: BlitzLayout<{ title?: string }> = ({ title, children }) => {
  return (
    <>
      <Head>
        <title>{title || "station-web"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* what will eventually become the nav */}
      <div className="h-12 w-full px-4 bg-tunnel-black flex flex-row justify-between border-b border-b-concrete">
        <Dropdown
          className="self-center"
          button={<Image src={logo} alt="Station logo, the letters station spelled out." />}
          items={[
            { name: "newstand", href: "/newstand" },
            { name: "contact the staff", href: "/contact" },
            { name: "discord", href: "/discord" },
            { name: "twitter", href: "/twitter" },
          ]}
        />

        <div className="flex items-center">
          <span className="p-4 border-l border-l-concrete uppercase text-marble-white text-lg">
            Map
          </span>
          <span className="p-4 border-l border-l-concrete block">
            <SoundIcon />
          </span>
          <span className="p-4 pr-0 uppercase text-magic-mint text-lg border-l border-l-concrete">
            Enter Station
          </span>
        </div>
      </div>
      <Ticker />
      {children}
    </>
  )
}

export default Layout
