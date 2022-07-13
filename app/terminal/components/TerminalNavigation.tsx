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
import GithubIcon from "public/github-icon.svg"
import TwitterIcon from "public/twitter-icon.svg"
import SiteIcon from "public/personal-site-icon.svg"
import InstagramIcon from "public/instagram-icon.svg"
import TikTokIcon from "public/tiktok-icon.svg"
import SettingsIcon from "app/core/icons/SettingsIcon"
import Exit from "/public/exit-button.svg"
import getTerminalByHandle from "../queries/getTerminalByHandle"
import useStore from "app/core/hooks/useStore"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
import DirectoryIcon from "app/core/icons/DirectoryIcon"
import BulletinIcon from "app/core/icons/BulletinIcon"
import hasAdminPermissionsBasedOnTags from "../../permissions/queries/hasAdminPermissionsBasedOnTags"

const TerminalNavigation = ({ children }: { children?: any }) => {
  const session = useSession({ suspense: false })
  const router = useRouter()
  const { tutorial } = useRouterQuery()
  const terminalHandle = useParam("terminalHandle", "string") as string
  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })
  const activeUser = useStore((state) => state.activeUser)
  const [hasAdminPermissions, setHasAdminPermissions] = useState<boolean>(false)

  const [hasAdminPermissionsFromTags] = useQuery(
    hasAdminPermissionsBasedOnTags,
    { terminalId: terminal?.id as number, accountId: activeUser?.id as number },
    {
      suspense: false,
    }
  )

  useEffect(() => {
    setHasAdminPermissions(
      hasAdminPermissionsFromTags ||
        !!terminal?.data?.permissions?.accountWhitelist?.includes(activeUser?.address as string)
    )
  }, [terminal, activeUser?.address, hasAdminPermissionsFromTags])

  return (
    <div className="grid md:grid-cols-5">
      <div
        className={`md:h-screen bg-tunnel-black border-r border-concrete ${
          !!tutorial && "z-40"
        } md:col-span-1`}
      >
        {!!tutorial && <div className="fixed inset-0 bg-tunnel-black opacity-70 z-10"></div>}
        <div className="px-4 border-b border-concrete">
          {/* Terminal Profile metadata + Settings icon*/}
          <div className="flex mt-7">
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
              <div className="mt-3 mr-2 ml-auto">
                <button
                  className={`${!!tutorial && "z-30"} group`}
                  onClick={() => {
                    if (!tutorial) {
                      router.push(Routes.TerminalSettingsPage({ terminalHandle }))
                    } else {
                      router.push(Routes.DiscordSettingsPage({ terminalHandle }))
                    }
                  }}
                >
                  <SettingsIcon className="group-hover:fill-concrete cursor-pointer" />
                </button>

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
          {/* Socials */}
          <div className="mt-6 mb-6">
            <p>{terminal?.data?.description}</p>
            <div className="flex flex-row mt-2"></div>
            {terminal?.data?.contactUrl && (
              <a
                href={terminal?.data?.contactUrl}
                target="_blank"
                className="hover:opacity-70 cursor-pointer mr-2"
                rel="noreferrer"
              >
                <Image src={SiteIcon} alt="Personal Site Icon." width={15} height={15} />
              </a>
            )}
            {terminal?.data?.twitterUrl && (
              <a
                href={terminal?.data?.twitterUrl}
                target="_blank"
                className="hover:opacity-70 cursor-pointer mr-2"
                rel="noreferrer"
              >
                <Image src={TwitterIcon} alt="Twitter Icon." width={15} height={15} />
              </a>
            )}
            {terminal?.data?.githubUrl && (
              <a
                href={terminal?.data?.githubUrl}
                target="_blank"
                className="hover:opacity-70 cursor-pointer mr-2"
                rel="noreferrer"
              >
                <Image src={GithubIcon} alt="Github Icon." width={15} height={15} />
              </a>
            )}
            {terminal?.data?.tiktokUrl && (
              <a
                href={terminal?.data?.tiktokUrl}
                target="_blank"
                className="hover:opacity-70 cursor-pointer mr-2"
                rel="noreferrer"
              >
                <Image src={TikTokIcon} alt="TikTok Icon." width={15} height={15} />
              </a>
            )}
            {terminal?.data?.instagramUrl && (
              <a
                href={terminal?.data?.instagramUrl}
                target="_blank"
                className="hover:opacity-70 cursor-pointer mr-2"
                rel="noreferrer"
              >
                <Image src={InstagramIcon} alt="Instagram Icon." width={15} height={15} />
              </a>
            )}
          </div>
        </div>

        {/* Terminal navigation */}
        <div>
          <ul className="mt-9 ml-8 text-lg space-y-2">
            <li className="group cursor-pointer font-bold">
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
                    : "text-concrete font-normal group-hover:text-light-concrete"
                }`}
              >
                <Link href={Routes.BulletinPage({ terminalHandle })}>Bulletin</Link>
              </p>
            </li>
            <li className="group cursor-pointer font-bold">
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
                    : "text-concrete font-normal group-hover:text-light-concrete"
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
