import { useState } from "react"
import { Image } from "blitz"
import Dropdown from "../components/Dropdown"
import logo from "../../../public/station_logo.svg"
import Sound from "../icons/Sound"

interface NavigationProps {
  user?: {
    handle: string
  }
}
/**
 * Navigation Component
 */
const Navigation = ({ user }: NavigationProps) => {
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true)

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
          <Sound
            isOn={isSoundOn}
            clickHandler={() => {
              setIsSoundOn(!isSoundOn)
            }}
          />
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
          <span className="p-4 pr-0 uppercase text-magic-mint text-lg border-l border-l-concrete">
            Enter Station
          </span>
        )}
      </div>
    </div>
  )
}

export default Navigation
