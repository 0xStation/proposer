import { useState, useEffect, useMemo } from "react"
import { Image, invoke } from "blitz"
import Dropdown from "../components/Dropdown"
import Map from "../components/Map"
import logo from "../../../public/station-logo.svg"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import useStore from "../hooks/useStore"
import ConnectWalletModal from "app/core/components/ConnectWalletModal"
import { useAccount } from "wagmi"
import AccountModal from "app/account/components/AccountModal"
import truncateString from "../utils/truncateString"

interface Wallet {
  address: string
}

/**
 * Navigation Component
 */
const Navigation = () => {
  // a list of the modals that are active on the screen
  const [wallet, setWallet] = useState<Wallet | null>()
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  })
  const address = useMemo(() => accountData?.address || undefined, [accountData?.address])
  const setAddress = useStore((state) => state.setAddress)
  const setActiveUser = useStore((state) => state.setActiveUser)
  const activeUser = useStore((state) => state.activeUser)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const toggleAccountModal = useStore((state) => state.toggleAccountModal)

  const getUserAccount = async (address) => {
    toggleWalletModal(false)
    let user = await invoke(getAccountByAddress, { address })
    if (user) {
      setActiveUser(user)
    } else {
      setTimeout(() => {
        setWallet({ address: address })
        toggleAccountModal(true)
      }, 500)
    }
  }

  useEffect(() => {
    if (address) {
      setTimeout(() => getUserAccount(address), 500)
    } else {
      setActiveUser(null)
      setWallet(null)
    }
  }, [address])

  return (
    <>
      <div className="h-12 w-full px-4 bg-tunnel-black flex flex-row justify-between border-b border-b-concrete">
        <Dropdown
          side="left"
          className="self-center"
          button={<Image src={logo} alt="Station logo, the letters station spelled out." />}
          items={[
            { name: "home", href: "/" },
            { name: "newstand", href: "https://station.mirror.xyz/" },
            { name: "contact the staff", href: "mailto:staff@station.express" },
            { name: "support", href: "https://6vdcjqzyfj3.typeform.com/to/kTlOjkdT" },
            { name: "twitter", href: "https://twitter.com/0xstation" },
          ]}
        />
        <div className="flex items-center border-l border-l-concrete">
          <Map />
          {activeUser ? (
            <Dropdown
              side="right"
              className="p-4 pr-0 border-l border-l-concrete"
              button={
                <div className="flex items-center">
                  {activeUser?.data?.pfpURL ? (
                    <img
                      src={activeUser?.data.pfpURL}
                      alt="PFP"
                      className="w-7 h-7 border border-marble-white rounded-full mr-2"
                    />
                  ) : (
                    <span className="w-7 h-7 rounded-full bg-concrete border border-marble-white mr-2"></span>
                  )}
                  <span>{accountData?.ens?.name || activeUser?.data?.name || "Handle"}</span>
                </div>
              }
              items={[
                {
                  name: "disconnect",
                  onClick: disconnect,
                },
              ]}
            />
          ) : address ? (
            <Dropdown
              side="right"
              className="p-4 pr-0 border-l border-l-concrete"
              button={
                <div className="flex items-center">
                  <span className="w-7 h-7 rounded-full bg-concrete border border-marble-white mr-2"></span>
                  <span>{truncateString(address)}</span>
                </div>
              }
              items={[
                { name: "Create Account", onClick: () => toggleAccountModal(true) },
                {
                  name: "disconnect",
                  onClick: disconnect,
                },
              ]}
            />
          ) : (
            <span
              className="p-4 pr-0 uppercase text-magic-mint text-lg border-l border-l-concrete cursor-pointer"
              onClick={() => toggleWalletModal(true)}
            >
              Enter Station
            </span>
          )}
        </div>
      </div>
    </>
  )
}

export default Navigation
