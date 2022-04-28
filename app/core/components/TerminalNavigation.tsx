import StationLogo from "public/station-logo.svg"
import SettingsIcon from "app/core/icons/SettingsIcon"
import MemberDirectoryIcon from "public/member-directory-icon.svg"
import LockedIcon from "public/locked-icon.svg"
import { Image, Link, Routes } from "blitz"
/**
 * TODO: Rename component + folder structure
 */
const TerminalNavigation = ({ children }: { children?: any }) => {
  return (
    <>
      <div className="h-screen w-[300px] bg-tunnel-black border-r border-concrete fixed">
        {/* Terminal Profile metadata + Settings icon*/}
        <div className="flex content-center ml-4 mt-6">
          <div className="align-middle text-center mr-2 rounded-lg border border-concrete w-[41px] h-[41px] mt-1">
            <Image src={StationLogo} alt="Station logo" height={34} width={34} />
          </div>
          <div className="flex flex-col content-center mr-[86px]">
            <div className="flex flex-row items-center space-x-1">
              <div className={`text-xl text-marble-white`}>Station Labs</div>
            </div>
            <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
              <div className="w-max truncate">@stationlabs</div>
            </div>
          </div>
          <div className="flex flex-col mt-3">
            <SettingsIcon className="hover:fill-concrete cursor-pointer" />
          </div>
        </div>
        {/* Terminal navigation */}
        <div>
          <ul className="mt-9 ml-8 text-lg space-y-2">
            <li className={`cursor-pointer hover:text-marble-white`}>
              {/* <Link href={Routes.TerminalInitiativePage({ terminalHandle })}> */}
              <div className="inline mr-5">
                <Image src={MemberDirectoryIcon} alt="Member directory icon" />
              </div>
              Member Directory
              {/* </Link> */}
            </li>
            <li className="text-concrete cursor-pointer">
              <div className="inline mr-5">
                <Image src={LockedIcon} alt="Locked icon" />
              </div>
              Proposals
            </li>
          </ul>
        </div>
      </div>
      <div className="h-screen left-[380px] w-[calc(100%-380px)] fixed">{children}</div>
    </>
  )
}

export default TerminalNavigation
