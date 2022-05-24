import { useRouterQuery, useRouter } from "blitz"
import SettingsIcon from "app/core/icons/SettingsIcon"
import MemberDirectoryIcon from "public/member-directory-icon.svg"
import LockedIcon from "public/locked-icon.svg"
import { Image, Link, Routes, useParam, useQuery, useSession } from "blitz"
import Exit from "/public/exit-button.svg"
import getTerminalByHandle from "../queries/getTerminalByHandle"

const TerminalNavigation = ({ children }: { children?: any }) => {
  const session = useSession({ suspense: false })
  const router = useRouter()
  const { tutorial } = useRouterQuery()
  const terminalHandle = useParam("terminalHandle", "string") as string
  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })

  return (
    <>
      <div
        className={`h-screen w-[300px] bg-tunnel-black border-r border-concrete fixed ${
          !!tutorial && "z-50"
        }`}
      >
        {!!tutorial && <div className="fixed inset-0 bg-tunnel-black opacity-70 z-10"></div>}
        {/* Terminal Profile metadata + Settings icon*/}
        <div className="flex content-center ml-4 mt-7">
          <div className="align-middle text-center mr-2 rounded-lg border border-wet-concrete w-[41px] h-[41px] mt-1 overflow-hidden">
            <img src={terminal?.data?.pfpURL} alt="Station logo" height={41} width={41} />
          </div>
          <div className="flex flex-col content-center w-[200px] mr-[5px]">
            <div className="flex flex-row items-center">
              <p className="text-xl text-marble-white font-bold">{terminal?.data.name}</p>
            </div>
            <p className="flex flex-row text-sm text-concrete overflow-hidden leading-4">
              @{terminal?.handle}
            </p>
          </div>
          {session?.siwe?.address && (
            <div className="flex flex-col mt-3 relative">
              <Link href={Routes.TerminalSettingsPage({ terminalHandle })}>
                <button className={`${!!tutorial && "z-30"} group`}>
                  <SettingsIcon className="group-hover:fill-concrete cursor-pointer" />
                </button>
              </Link>

              {!!tutorial && (
                <div
                  className={`absolute bg-wet-concrete w-[200px] top-6 rounded p-2 flex items-center justify-between ${
                    !!tutorial && "z-30"
                  }`}
                >
                  <span className="text-xs mr-1">
                    Next, connect with Discord to import roles and members.
                  </span>
                  <span
                    className="text-torch-red cursor-pointer"
                    onClick={() => {
                      router.push(window.location.href.split("?")[0] || window.location.href)
                    }}
                  >
                    <Image src={Exit} alt="Close button" width={16} height={16} />
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Terminal navigation */}
        <div>
          <ul className="mt-9 ml-8 text-lg space-y-2">
            <li className="cursor-pointer hover:text-marble-white font-bold">
              <div className="inline mr-5 align-middle">
                <Image src={MemberDirectoryIcon} alt="Member directory icon" />
              </div>
              <p className="inline">
                <Link href={Routes.MemberDirectoryPage({ terminalHandle })}>Members</Link>
              </p>
            </li>
            <li className="text-concrete cursor-pointer group">
              <div className="inline mr-5 align-middle">
                <Image src={LockedIcon} alt="Locked icon" />
              </div>
              <p className="inline">Proposals</p>
              <span className="group-hover:scale-100 text-xs uppercase font-bold tracking-wider rounded-md p-2 ml-3 absolute text-marble-white bg-wet-concrete sidebar-tooltip transition-all duration-100 scale-0 origin-left">
                Coming soon
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="h-screen left-[370px] w-[calc(100%-370px)] fixed">{children}</div>
    </>
  )
}

export default TerminalNavigation
