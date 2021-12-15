import { BlitzPage } from "blitz"
import Layout from "app/core/layouts/Layout"

const Home: BlitzPage = () => {
  return (
    <main className="w-screen h-screen">
      <div style={{ left: "40%", top: "40%" }} className="absolute">
        <button className="px-48 py-12 text-center bg-magic-mint no-underline border-2">
          Connect Wallet
        </button>
      </div>
    </main>
  )
}

Home.suppressFirstRenderFlicker = true
Home.getLayout = (page) => <Layout title="Home">{page}</Layout>

export default Home
