import { BlitzPage, invoke, useRouter } from "blitz"
import Layout from "app/core/layouts/Layout"
import Button from "app/core/components/Button"
import useStore from "app/core/hooks/useStore"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import { useAccount } from "wagmi"
import { useEffect, useMemo } from "react"

const Home: BlitzPage = () => {
  const router = useRouter()
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const setActiveUser = useStore((state) => state.setActiveUser)
  const { data: accountData } = useAccount()

  const address = useMemo(() => accountData?.address || undefined, [accountData?.address])

  const getUserAccount = async (address) => {
    // closing the wallet modal
    // we have the address (since this is called from the useEffect hook)
    toggleWalletModal(false)
    let user = await invoke(getAccountByAddress, { address })
    if (user) {
      setActiveUser(user)
    } else {
      router.push("/profile/create")
    }
  }

  useEffect(() => {
    if (address) {
      getUserAccount(address)
    } else {
      setActiveUser(null)
    }
  }, [address])

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
