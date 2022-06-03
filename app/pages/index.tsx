import { BlitzPage, useRouter, useSession, invoke } from "blitz"
import { useEffect } from "react"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import useStore from "app/core/hooks/useStore"
import { ConnectWalletComponent } from "app/core/components/ConnectWalletComponent"
import getAccountByAddress from "app/account/queries/getAccountByAddress"

const Home: BlitzPage = () => {
  const router = useRouter()
  const activeUser = useStore((state) => state.activeUser)
  const setActiveUser = useStore((state) => state.setActiveUser)
  const session = useSession({ suspense: false })

  useEffect(() => {
    if (!session?.siwe?.address) {
      return
    }

    if (activeUser) {
      router.push(`/profile/${session?.siwe?.address}`)
    } else {
      ;(async () => {
        let user = await invoke(getAccountByAddress, { address: session?.siwe?.address })
        if (user) {
          setActiveUser(user)
          router.push(`/profile/${session?.siwe?.address}`)
        } else {
          router.push(`/profile/create`)
        }
      })()
    }
  }, [activeUser, session?.siwe?.address])

  return (
    <LayoutWithoutNavigation title="Station">
      <div className="bg-wet-concrete w-full h-8 text-center align-center pt-1">
        We&apos;re still in beta. Have feedback?{" "}
        <a
          className="text-magic-mint"
          href="https://twitter.com/messages/compose?recipient_id=1412594810985271296"
        >
          Let us know
        </a>
        .
      </div>
      <main
        className="h-screen bg-cover bg-no-repeat"
        style={{ backgroundImage: "url('/station-cover-v2.webp')" }}
      >
        <ConnectWalletComponent />
      </main>
    </LayoutWithoutNavigation>
  )
}

Home.suppressFirstRenderFlicker = true
// I wasn't able to figure out how to pass props (like connected user) when using this .getLayout method.
// I think it helps to reduce redudant component loads, which is nice, and maybe worth figuring out in the future.
// https://adamwathan.me/2019/10/17/persistent-layout-patterns-in-nextjs/

// Home.getLayout = (page) => <Layout title="Home">{page}</Layout>

export default Home
