import { Head, BlitzLayout } from "blitz"
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
      {/* {chainData?.chain?.id !== undefined && chainData?.chain?.id !== 4 ? (
        <>
          <Navigation />
          <div className="flex items-center justify-center min-h-[calc(100vh-15rem)]">
            <div className="text-marble-white text-center">
              <h1 className="text-4xl">Incorrect Network</h1>
              <p className="max-w-lg mt-4">
                Currently, the Station network only supports Rinkeby. Please switch your connection
                to the Rinkeby chain. If you are having trouble connecting to Rinkeby, check out our
                FAQ{" "}
                <a
                  target="_blank"
                  className="text-magic-mint"
                  href="https://0xstation.notion.site/How-to-install-Rinkeby-ab71688f687c44faab6524daf19ab73a"
                  rel="noreferrer"
                >
                  here
                </a>
                .
              </p>

              {switchNetwork && (
                <button
                  className="rounded-lg px-2 py-1 mt-4 bg-magic-mint text-tunnel-black"
                  onClick={() => switchNetwork(4)}
                >
                  Switch to Rinkeby
                </button>
              )}
            </div>
          </div>
        </>
      ) : ( */}
      <>
        <ModalContainer />
        <Navigation />
        {children}
      </>
      {/* )} */}
    </>
  )
}

export default Layout
