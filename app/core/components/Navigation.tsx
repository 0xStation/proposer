import { useEffect, useMemo } from "react"
import { Image, invoke, useRouter } from "blitz"
import Dropdown from "../components/Dropdown"
import logo from "../../../public/station-logo.svg"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import useStore from "../hooks/useStore"
import { useAccount } from "wagmi"
import truncateString from "../utils/truncateString"
import { LOCAL_STORAGE } from "../utils/constants"
import ExplorePopover from "./Explore/ExplorePopover"

/**
 * Navigation Component
 */
const Navigation = () => {
  const router = useRouter()
  // a list of the modals that are active on the screen
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  })

  const address = useMemo(() => accountData?.address || undefined, [accountData?.address])
  const setActiveUser = useStore((state) => state.setActiveUser)
  const activeUser = useStore((state) => state.activeUser)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)

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
    } else if (!localStorage.getItem(LOCAL_STORAGE.CONNECTION)) {
      setActiveUser(null)
    }
  }, [address])

  const appDisconnect = () => {
    // we're reading from localStorage at the app level
    // to see if we need to maintain a wallet connection
    if (localStorage.getItem(LOCAL_STORAGE.CONNECTION)) {
      localStorage.removeItem(LOCAL_STORAGE.CONNECTION)
    }
    disconnect()
  }

  return (
    <>
      <div className="h-12 w-full bg-tunnel-black flex flex-row justify-between border-b border-b-concrete">
        <Dropdown
          side="left"
          className="h-full pt-[.60rem] hover:bg-wet-concrete pl-4 pr-1"
          button={
            <div className="h-full flex items-center">
              <Image src={logo} alt="Station logo, the letters station spelled out." />
            </div>
          }
          items={[
            { name: "home", href: "/" },
            { name: "open terminal", href: "https://6vdcjqzyfj3.typeform.com/to/Ik09gzw6" },
            { name: "newstand", href: "https://station.mirror.xyz/" },
            { name: "twitter", href: "https://twitter.com/0xstation" },
            { name: "help desk", href: "https://6vdcjqzyfj3.typeform.com/to/kTlOjkdT" },
            {
              name: "legal & privacy",
              href: "https://www.notion.so/0xstation/Legal-Privacy-a3b8da1a13034d1eb5f81482ec637176",
            },
          ]}
        />
        <div className="flex items-center border-l border-l-concrete">
          <ExplorePopover />
          {activeUser ? (
            <Dropdown
              side="right"
              className="p-4 border-l border-l-concrete hover:bg-wet-concrete w-full"
              button={
                <div className="flex items-center">
                  {activeUser?.data?.pfpURL ? (
                    <img
                      src={activeUser?.data.pfpURL}
                      alt="PFP"
                      className="w-7 h-7 border border-marble-white rounded-full mr-2"
                    />
                  ) : (
                    <span className="w-7 h-7 rounded-full bg-gradient-to-b object-cover from-electric-violet to-magic-mint border border-marble-white mr-2"></span>
                  )}
                  <span>{accountData?.ens?.name || activeUser?.data?.name || "Handle"}</span>
                </div>
              }
              items={[
                {
                  name: "Profile",
                  onClick: () => router.push(`/profile/${activeUser.address}`),
                },
                {
                  name: "Disconnect",
                  onClick: appDisconnect,
                },
              ]}
            />
          ) : address ? (
            <Dropdown
              side="right"
              className="p-4 border-l border-l-concrete hover:bg-wet-concrete w-full"
              button={
                <div className="flex items-center">
                  <span className="w-7 h-7 rounded-full bg-gradient-to-b from-electric-violet to-magic-mint border border-marble-white mr-2"></span>
                  <span>{truncateString(address)}</span>
                </div>
              }
              items={[
                { name: "Create Account", onClick: () => router.push("/profile/create") },
                {
                  name: "disconnect",
                  onClick: appDisconnect,
                },
              ]}
            />
          ) : (
            <span
              className="p-4 uppercase text-magic-mint text-lg border-l border-l-concrete cursor-pointer hover:bg-wet-concrete"
              onClick={() => toggleWalletModal(true)}
            >
              Connect Wallet
            </span>
          )}
        </div>
      </div>
    </>
  )
}

export default Navigation
