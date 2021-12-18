import { Head, BlitzLayout } from "blitz"
import { Image } from "blitz"
import Ticker from "../components/Ticker"
import Dropdown from "../components/Dropdown"
import logo from "../../../public/station_logo.svg"

const Layout: BlitzLayout<{ title?: string }> = ({ title, children }) => {
  return (
    <>
      <Head>
        <title>{title || "station-web"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="h-12 w-full px-4 bg-tunnel-black flex items-center border-b border-b-[#646464]">
        <Dropdown
          button={
            <Image
              // trust me I hate this too but I have to do it for next.js to work.
              // it does some annoying image optimization stuff that end up resizing the container.
              // see here: https://github.com/vercel/next.js/issues/18915
              className="h-[28px]"
              src={logo}
              alt="Station logo, the letters station spelled out."
            />
          }
          items={[
            { name: "newstand", href: "/newstand" },
            { name: "contact the staff", href: "/contact" },
            { name: "discord", href: "/discord" },
            { name: "twitter", href: "/twitter" },
          ]}
        />
      </div>
      <Ticker />
      {children}
    </>
  )
}

export default Layout
