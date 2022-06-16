import {
  useRouterQuery,
  useRouter,
  Image,
  Link,
  Routes,
  useParam,
  useQuery,
  useSession,
} from "blitz"
import { useState, useEffect } from "react"
import SettingsIcon from "app/core/icons/SettingsIcon"
import MemberDirectoryIcon from "public/member-directory-icon.svg"
import Exit from "/public/exit-button.svg"
import getTerminalByHandle from "../queries/getTerminalByHandle"
import useStore from "app/core/hooks/useStore"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
import DirectoryIcon from "app/core/icons/DirectoryIcon"
import BulletinIcon from "app/core/icons/BulletinIcon"

const TerminalNavigation = ({ children }: { children?: any }) => {
  const session = useSession({ suspense: false })
  const router = useRouter()
  const { tutorial } = useRouterQuery()
  const terminalHandle = useParam("terminalHandle", "string") as string
  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })
  const activeUser = useStore((state) => state.activeUser)
  const [hasAdminPermissions, setHasAdminPermissions] = useState<boolean>(false)

  useEffect(() => {
    setHasAdminPermissions(
      !!terminal?.data?.permissions?.accountWhitelist?.includes(activeUser?.address as string)
    )
  }, [terminal, activeUser?.address])

  return (
    <div className="grid md:grid-cols-5">
      <div
        className={`md:h-screen bg-tunnel-black border-r border-concrete ${
          !!tutorial && "z-40"
        } md:col-span-1`}
      >
        {!!tutorial && <div className="fixed inset-0 bg-tunnel-black opacity-70 z-10"></div>}
        {/* Terminal Profile metadata + Settings icon*/}
        <div className="flex content-center ml-4 mt-7">
          {terminal?.data.pfpURL ? (
            <img
              src={terminal?.data.pfpURL}
              alt="Terminal PFP"
              className="min-w-[41px] max-w-[41px] h-[41px] rounded-md cursor-pointer border border-wet-concrete mr-2"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_PFP_URLS.TERMINAL
              }}
            />
          ) : (
            <span className="w-[41px] h-[41px] rounded-md cursor-pointer border border-wet-concrete bg-gradient-to-b from-neon-blue to-torch-red mr-2" />
          )}
          <div className="flex flex-col content-center w-[200px] mr-[5px]">
            <div className="flex flex-row items-center">
              <p className="text-xl text-marble-white font-bold">{terminal?.data.name}</p>
            </div>
            <p className="flex flex-row text-sm text-concrete overflow-hidden leading-4">
              @{terminal?.handle}
            </p>
          </div>
          {session?.siwe?.address && hasAdminPermissions && (
            <div className="flex flex-col mt-3 relative mr-2">
              <Link
                href={
                  !tutorial
                    ? Routes.TerminalSettingsPage({ terminalHandle })
                    : Routes.DiscordSettingsPage({ terminalHandle })
                }
              >
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
            <li className="group cursor-pointer hover:text-marble-white font-bold">
              <BulletinIcon
                className={`inline mr-5 mb-1 ${
                  router.pathname.includes(Routes.BulletinPage({ terminalHandle }).pathname)
                    ? "fill-marble-white"
                    : "fill-concrete group-hover:fill-light-concrete"
                }`}
              />
              <p
                className={`inline ${
                  router.pathname.includes(Routes.BulletinPage({ terminalHandle }).pathname)
                    ? "text-marble-white font-bold"
                    : "text-concrete group-hover:text-light-concrete"
                }`}
              >
                <Link href={Routes.BulletinPage({ terminalHandle })}>Bulletin</Link>
              </p>
            </li>
            <li className="group cursor-pointer hover:text-marble-white font-bold">
              <DirectoryIcon
                className={`inline mr-5 mb-1 ${
                  router.pathname === Routes.MemberDirectoryPage({ terminalHandle }).pathname
                    ? "fill-marble-white"
                    : "fill-concrete group-hover:fill-light-concrete"
                }`}
                fill={
                  router.pathname === Routes.MemberDirectoryPage({ terminalHandle }).pathname
                    ? "fill-marble-white"
                    : "fill-concrete group-hover:text-light-concrete"
                }
              />
              <p
                className={`inline ${
                  router.pathname === Routes.MemberDirectoryPage({ terminalHandle }).pathname
                    ? "text-marble-white font-bold"
                    : "text-concrete hover:text-light-concrete"
                }`}
              >
                <Link href={Routes.MemberDirectoryPage({ terminalHandle })}>Members</Link>
              </p>
            </li>
          </ul>
        </div>
      </div>
      <div className="h-screen md:col-span-4">{children}</div>
    </div>
  )
}

export default TerminalNavigation
