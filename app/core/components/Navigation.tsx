import { useState, useEffect } from "react"
import { Image, invoke } from "blitz"
import Dropdown from "../components/Dropdown"
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
  const setActiveUser = useStore((state) => state.setActiveUser)

  useEffect(() => {
    if (accountData?.address) {
      const { address } = accountData
      getUserAccount(address)
    } else {
      setActiveUser(null)
      setUser(null)
    }
  }, [accountData?.address])

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

        <div className="flex items-center">
          <span className="p-4 border-l border-l-concrete uppercase text-marble-white text-lg cursor-pointer">
            Map
          </span>
          {user ? (
            <Dropdown
              side="right"
              className="p-4 pr-0 border-l border-l-concrete"
              button={
                <div className="flex items-center">
                  <span className="w-7 h-7 rounded-full bg-concrete border border-marble-white mr-2"></span>
                  <span>{accountData?.ens?.name || user?.data?.handle || "Handle"}</span>
                </div>
              }
              items={[
                { name: "profile", href: "/newstand" },
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
