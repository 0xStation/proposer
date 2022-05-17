import { BlitzPage, useRouter, useSession } from "blitz"
import { useEffect } from "react"
import Layout from "app/core/layouts/Layout"
import useStore from "app/core/hooks/useStore"

const Home: BlitzPage = () => {
  const router = useRouter()
  const activeUser = useStore((state) => state.activeUser)
  const session = useSession({ suspense: false })

  useEffect(() => {
    if (!session?.siwe?.address) {
      return
    }
    if (activeUser) {
      router.push(`/profile/${session?.siwe?.address}`)
    } else {
      router.push(`/profile/create`)
    }
  }, [activeUser])

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
