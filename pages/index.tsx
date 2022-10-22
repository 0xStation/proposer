import { gSSP } from "app/blitz-server"
import { invoke } from "@blitzjs/rpc"
import { useSession, getSession } from "@blitzjs/auth"
import { useRouter } from "next/router"
import { BlitzPage } from "@blitzjs/next"
import { useEffect } from "react"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import useStore from "app/core/hooks/useStore"
import { ConnectWalletComponent } from "app/core/components/ConnectWalletComponent"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import createAccount from "app/account/mutations/createAccount"

export const getServerSideProps = gSSP(async ({ req, res }) => {
  const session = await getSession(req, res)

  if (session?.siwe?.address) {
    return {
      redirect: {
        destination: `/workspace/${session?.siwe?.address}`,
        permanent: false,
      },
    }
  }

  return {
    props: {}, // will be passed to the page component as props
  }
})

const Home: BlitzPage = () => {
  const router = useRouter()
  const activeUser = useStore((state) => state.activeUser)
  const setActiveUser = useStore((state) => state.setActiveUser)
  const session = useSession({ suspense: false })
  const setToastState = useStore((state) => state.setToastState)

  useEffect(() => {
    if (!session?.siwe?.address) {
      return
    }

    if (activeUser) {
      router.push(`/workspace/${session?.siwe?.address}`)
    } else {
      ;(async () => {
        try {
          let user = await invoke(getAccountByAddress, { address: session?.siwe?.address })
          if (user) {
            setActiveUser(user)
          } else {
            await invoke(createAccount, { address: session?.siwe?.address, createSession: true })
          }
          router.push(`/workspace/${session?.siwe?.address}`)
        } catch (err) {
          console.error(err)
          setToastState({ isToastShowing: true, type: "error", message: "Something went wrong." })
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
        className="h-screen bg-cover bg-no-repeat flex items-center flex-col justify-center"
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
