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
import AccountModal from "app/account/components/AccountModal"

interface Wallet {
  address: string
}

/**
 * Navigation Component
 */
const Navigation = () => {
  const [wallet, setWallet] = useState<Wallet | null>()
  let [walletModalOpen, setWalletModalOpen] = useState(false)
  let [accountModalOpen, setAccountModalOpen] = useState(false)
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  })
  const address = useMemo(() => accountData?.address || undefined, [accountData?.address])
  const setActiveUser = useStore((state) => state.setActiveUser)
  const activeUser = useStore((state) => state.activeUser)

  useEffect(() => {
    if (address) {
      getUserAccount(address)
    }
  }, [address])

  const getUserAccount = async (address) => {
    let user = await invoke(getAccountByAddress, { address })
    console.log(address)
    console.log(user)
    if (user) {
      setActiveUser(user)
      setWalletModalOpen(false)
    } else {
      setWalletModalOpen(false)
      setWallet({ address: address })
      setAccountModalOpen(true)
    }
  }

  return (
    <>
      {wallet && (
        <AccountModal
          isOpen={accountModalOpen}
          setIsOpen={setAccountModalOpen}
          address={wallet.address}
        />
      )}
      <ConnectWalletModal isWalletOpen={walletModalOpen} setIsWalletOpen={setWalletModalOpen} />
      <div className="h-12 w-full px-4 bg-tunnel-black flex flex-row justify-between border-b border-b-concrete">
        <Dropdown
          side="left"
          className="self-center"
          button={<Image src={logo} alt="Station logo, the letters station spelled out." />}
          items={[
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
                  <span>{accountData?.ens?.name || activeUser?.data?.handle || "Handle"}</span>
                </div>
              }
              items={[
                {
                  name: "disconnect",
                  onClick: disconnect,
                },
              ]}
            />
          ) : wallet ? (
            <Dropdown
              side="right"
              className="p-4 pr-0 border-l border-l-concrete"
              button={
                <div className="flex items-center">
                  <span className="w-7 h-7 rounded-full bg-concrete border border-marble-white mr-2"></span>
                  <span>{wallet.address}</span>
                </div>
              }
              items={[
                { name: "Create Account", onClick: () => setAccountModalOpen(true) },
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
