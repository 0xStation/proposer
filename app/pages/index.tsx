import { BlitzPage } from "blitz"
import Layout from "app/core/layouts/Layout"

const Home: BlitzPage = () => {
  return (
    <Layout title="Station">
      <main
        className="h-full bg-cover bg-no-repeat"
        style={{ backgroundImage: "url('/station-cover.webp')" }}
      ></main>
    </Layout>
  )
}

Home.suppressFirstRenderFlicker = true
// I wasn't able to figure out how to pass props (like connected user) when using this .getLayout method.
// I think it helps to reduce redudant component loads, which is nice, and maybe worth figuring out in the future.
// https://adamwathan.me/2019/10/17/persistent-layout-patterns-in-nextjs/

// Home.getLayout = (page) => <Layout title="Home">{page}</Layout>

export default Home
