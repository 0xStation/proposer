import { useEffect, useMemo, useState } from "react"
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
  const setActiveUser = useStore((state) => state.setActiveUser)
  const activeUser = useStore((state) => state.activeUser)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const setSiweAddress = useStore((state) => state.setSiweAddress)
  const siweAddress = useStore((state) => state.siweAddress)
  const authorized = useStore((state) => state.authorized)

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
    const handler = async () => {
      if (siweAddress && activeUser) {
        // if user is already defined, return
        return
      }

      try {
        const res = await fetch("/api/me")
        const json = await res.json()
        setSiweAddress(json.address)
        if (json.address) {
          await getUserAccount(json.address)
        }
      } catch (err) {
        console.error("could not fetch user")
      }
    }
    // 1. page loads
    ;(async () => await handler())()

    // 2. window is focused (in case user logs out of another window)
    window.addEventListener("focus", handler)
    return () => window.removeEventListener("focus", handler)
  }, [authorized])

  const appDisconnect = async () => {
    // we're reading from localStorage at the app level
    // to see if we need to maintain a wallet connection
    if (localStorage.getItem(LOCAL_STORAGE.CONNECTION)) {
      localStorage.removeItem(LOCAL_STORAGE.CONNECTION)
    }
    disconnect()
    setActiveUser(null)
    setSiweAddress(undefined)
    await fetch("/api/logout")
  }

  return (
    <>
      {/* beta banner */}
      <div className="bg-wet-concrete w-full h-8 text-center align-center pt-1">
        We&apos;re still in beta. Have feedback?{" "}
        <a className="text-magic-mint" href="https://twitter.com/0xstation">
          Let us know
        </a>
        .
      </div>
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
              className="h-full p-2 border-l border-l-concrete hover:bg-wet-concrete w-full"
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
                  onClick: async () => await appDisconnect(),
                },
              ]}
            />
          ) : siweAddress ? (
            <Dropdown
              side="right"
              className="h-full p-2 border-l border-l-concrete hover:bg-wet-concrete w-full"
              button={
                <div className="flex items-center">
                  <span className="w-7 h-7 rounded-full bg-gradient-to-b from-electric-violet to-magic-mint border border-marble-white mr-2"></span>
                  <span>{truncateString(siweAddress)}</span>
                </div>
              }
              items={[
                { name: "Create Account", onClick: () => router.push("/profile/create") },
                {
                  name: "disconnect",
                  onClick: async () => await appDisconnect(),
                },
              ]}
            />
          ) : (
            <span
              className="h-full p-2 uppercase text-magic-mint text-sm sm:text-lg border-l border-l-concrete cursor-pointer hover:bg-wet-concrete"
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
