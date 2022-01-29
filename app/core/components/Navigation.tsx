import { useState, useEffect, useMemo } from "react"
import { Image, invoke } from "blitz"
import Dropdown from "../components/Dropdown"
import Map from "../components/Map"
import logo from "../../../public/station-logo.svg"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import { Account } from "../../account/types"
import useStore from "../hooks/useStore"
import ConnectWalletModal from "app/core/components/ConnectWalletModal"
import { useAccount } from "wagmi"

/**
 * Navigation Component
 */
const Navigation = () => {
  const [user, setUser] = useState<Account | null>()
  let [walletModalOpen, setWalletModalOpen] = useState(false)
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  })
  const address = useMemo(() => accountData?.address || undefined, [accountData?.address])
  const setActiveUser = useStore((state) => state.setActiveUser)

  useEffect(() => {
    if (address) {
      getUserAccount(address)
    } else {
      setActiveUser(null)
      setUser(null)
    }
  }, [address])

  const getUserAccount = async (address) => {
    let user = await invoke(getAccountByAddress, { address })
    if (user) {
      setActiveUser(user)
      setUser(user)
      setWalletModalOpen(false)
    }
  }

  return (
    <>
      <ConnectWalletModal isWalletOpen={walletModalOpen} setIsWalletOpen={setWalletModalOpen} />
      <div className="h-12 w-full px-4 bg-tunnel-black flex flex-row justify-between border-b border-b-concrete">
        <Dropdown
          side="left"
          className="self-center"
          button={<Image src={logo} alt="Station logo, the letters station spelled out." />}
          items={[
            { name: "newstand", href: "https://station.mirror.xyz/" },
            { name: "contact the staff", href: "mailto:staff@station.express" },
            { name: "discord", href: "https://discord.gg/pJEFvQ3w9w" },
            { name: "twitter", href: "https://twitter.com/0xstation" },
          ]}
        />
        <div className="flex items-center border-l border-l-concrete">
          <Map />
          {user ? (
            <Dropdown
              side="right"
              className="p-4 pr-0 border-l border-l-concrete"
              button={
                <div className="flex items-center">
                  {user?.data?.pfpURL ? (
                    <img
                      src={user?.data.pfpURL}
                      alt="PFP"
                      className="w-7 h-7 border border-marble-white rounded-full mr-2"
                    />
                  ) : (
                    <span className="w-7 h-7 rounded-full bg-concrete border border-marble-white mr-2"></span>
                  )}
                  <span>{accountData?.ens?.name || user?.data?.handle || "Handle"}</span>
                </div>
              }
              items={[
                { name: "profile", href: "/profile" },
                {
                  name: "disconnect",
                  onClick: disconnect,
                },
              ]}
            />
          ) : (
            <span
              className="p-4 pr-0 uppercase text-magic-mint text-lg border-l border-l-concrete cursor-pointer"
              onClick={() => setWalletModalOpen(true)}
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
