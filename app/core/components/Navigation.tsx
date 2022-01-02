import { useState, useEffect } from "react"
import { Image, invoke } from "blitz"
import { useEthers } from "@usedapp/core"
import logo from "../../../public/station-logo.svg"
import subwayAudioClip from "../../../public/subway.mp3"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import Dropdown from "../components/Dropdown"
import Sound from "../icons/SoundIcon"
import { useAudio } from "../hooks/useAudio"

/**
 * Navigation Component
 */
const Navigation = () => {
  const [user, setUser] = useState<Account>()
  const [isSoundOn, setIsSoundOn] = useAudio(subwayAudioClip)
  const { activateBrowserWallet, account, active } = useEthers()

  useEffect(() => {
    if (account) {
      getUserAccount(account)
    }
  }, [account])

  const getUserAccount = async (account) => {
    let user = await invoke(getAccountByAddress, { address: account })
    if (user) {
      setUser(user)
    }
  }

  return (
    <div className="h-12 w-full px-4 bg-tunnel-black flex flex-row justify-between border-b border-b-concrete">
      <Dropdown
        side="left"
        className="self-center"
        button={<Image src={logo} alt="Station logo, the letters station spelled out." />}
        items={[
          { name: "newstand", href: "/newstand" },
          { name: "contact the staff", href: "/contact" },
          { name: "discord", href: "/discord" },
          { name: "twitter", href: "/twitter" },
        ]}
      />

      <div className="flex items-center">
        <span className="p-4 border-l border-l-concrete uppercase text-marble-white text-lg cursor-pointer">
          Map
        </span>
        <span className="p-4 border-l border-l-concrete block">
          <Sound isOn={isSoundOn} clickHandler={setIsSoundOn} />
        </span>
        {user ? (
          <Dropdown
            side="right"
            className="p-4 pr-0 border-l border-l-concrete"
            button={
              <div className="flex items-center">
                <span className="w-7 h-7 rounded-full bg-concrete border border-marble-white mr-2"></span>
                <span>{user.handle}</span>
              </div>
            }
            items={[
              { name: "profile", href: "/newstand" },
              { name: "disconnect", href: "/contact" },
            ]}
          />
        ) : (
          <span
            className="p-4 pr-0 uppercase text-magic-mint text-lg border-l border-l-concrete cursor-pointer"
            onClick={() => activateBrowserWallet()}
          >
            Enter Station
          </span>
        )}
      </div>
    </div>
  )
}

export default Navigation
