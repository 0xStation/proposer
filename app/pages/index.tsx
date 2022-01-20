import { Router } from "blitz"
import { useMemo, useEffect } from "react"
import { useAccount } from "wagmi"
import { users } from "../core/utils/data"
import { BlitzPage } from "blitz"
import Layout from "app/core/layouts/Layout"

const Home: BlitzPage = () => {
  const [{ data: accountData }] = useAccount()
  const connectedUser: Account = useMemo(
    () => (accountData?.address ? users[accountData?.address] : null),
    [accountData?.address]
  )

  const onError = (error: Error) => {
    console.log(error.message)
  }

  useEffect(() => {
    if (connectedUser) {
      const terminalId = window && window.location?.host?.includes("localhost") ? "1" : "3"
      Router.push(`/terminal/${terminalId}/contributors`)
    }
  }, [connectedUser])

  const ConnectView = (
    <div className="flex items-center h-full ml-40">
      <div className="bg-tunnel-black border border-marble-white p-4 w-128">
        <h3 className="text-marble-white text-3xl">Welcome to Station</h3>
        <p className="text-marble-white text-sm mt-4">
          This is where contributors come together and discover and participate in some of the most
          exciting communities in Web3.
        </p>
        <p className="text-marble-white text-sm mt-4">Join the ride.</p>
        <button
          className="mt-4 w-full py-2 text-center text-sm bg-magic-mint rounded"
          onClick={() => console.log("TODO~")}
        >
          Enter Station
        </button>
      </div>
    </div>
  )

  return (
    <Layout title="Home">
      <main
        className="w-full h-[calc(100vh-6rem)] bg-cover bg-no-repeat"
        style={{ backgroundImage: "url('/station-cover.png')" }}
      >
        {ConnectView}
      </main>
    </Layout>
  )
}

Home.suppressFirstRenderFlicker = true
// I wasn't able to figure out how to pass props (like connected user) when using this .getLayout method.
// I think it helps to reduce redudant component loads, which is nice, and maybe worth figuring out in the future.
// https://adamwathan.me/2019/10/17/persistent-layout-patterns-in-nextjs/

// Home.getLayout = (page) => <Layout title="Home">{page}</Layout>

export default Home
