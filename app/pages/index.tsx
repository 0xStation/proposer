import { Router } from "blitz"
import { BlitzPage } from "blitz"
import Layout from "app/core/layouts/Layout"
import { useAccount } from "wagmi"

const Home: BlitzPage = () => {
  const redirectToTerminal = () => {
    // TODO: this function should open up the terminal map explorer
    // which allows users to choose which terminal they want to "enter".
    // In the meantime we will redirect them to Station since it's the
    // only terminal.
    Router.push(`/terminal/stationlabs/initiative-board`)
  }

  const [{ data: accountData }] = useAccount({
    fetchEns: true,
  })

  const ConnectView = (
    <div className="flex items-center h-full ml-40">
      <div className="bg-tunnel-black border border-marble-white pt-10 px-5 pb-5 w-128">
        <h3 className="text-marble-white text-3xl">Welcome to Station</h3>
        <p className="text-marble-white text-base mt-4">
          This is where contributors come together, discover, and participate in the most exciting
          places in Web3.
        </p>
        <p className="text-marble-white text-base mt-4">Join the ride.</p>
        <button
          className="mt-4 w-full py-2 text-center text-base bg-magic-mint rounded"
          onClick={() => redirectToTerminal()}
        >
          {accountData?.address ? "Start Exploring" : "Enter Station"}
        </button>
      </div>
    </div>
  )

  return (
    <Layout title="Station">
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
