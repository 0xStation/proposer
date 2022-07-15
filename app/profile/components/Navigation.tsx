import { useState } from "react"
import useStore from "app/core/hooks/useStore"
import { getWalletString } from "app/utils/getWalletString"
import { useRouter, Image, Link, Routes } from "blitz"
import GithubIcon from "public/github-icon.svg"
import TwitterIcon from "public/twitter-icon.svg"
import PersonalSiteIcon from "public/personal-site-icon.svg"
import InstagramIcon from "public/instagram-icon.svg"
import TikTokIcon from "public/tiktok-icon.svg"
import { Terminal } from "app/terminal/types"
import { Account } from "app/account/types"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
import {
  ClipboardCheckIcon,
  ClipboardIcon,
  ExternalLinkIcon,
  LightBulbIcon,
  LibraryIcon,
} from "@heroicons/react/solid"

export const Navigation = ({
  account,
  children,
  setIsConnectDiscordModalOpen,
}: {
  account?: Account
  terminals?: Terminal[]
  children?: any
  setIsConnectDiscordModalOpen?: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const router = useRouter()
  const activeUser = useStore((state) => state.activeUser)
  const [isClipboardAddressCopied, setIsClipboardAddressCopied] = useState<boolean>(false)

  return (
    <div className="grid md:grid-cols-5">
      <div className="md:h-screen bg-tunnel-black border-r border-concrete md:col-span-1">
        <div className="h-[150px] relative mb-[116px]">
          {account?.data.coverURL ? (
            <img
              alt="The user's cover photo."
              src={account?.data.coverURL}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_PFP_URLS.USER
              }}
            />
          ) : (
            <div className="bg-gradient-to-b object-cover from-electric-violet to-magic-mint h-full w-full"></div>
          )}
          {account?.data.pfpURL ? (
            <img
              src={account?.data.pfpURL}
              alt="The user's profile picture."
              className="bg-gradient-to-b from-electric-violet to-magic-mint w-[142px] h-[142px] border-4 border-tunnel-black rounded-full absolute bottom-[-100px] left-0 right-0 mx-auto"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_PFP_URLS.USER
              }}
            />
          ) : (
            <div className="bg-gradient-to-b from-electric-violet to-magic-mint w-[142px] h-[142px] border-4 border-tunnel-black rounded-full absolute bottom-[-100px] left-0 right-0 mx-auto"></div>
          )}
        </div>
        <div className="px-8 border-b border-concrete pb-6">
          <div className="flex flex-col">
            <h1 className="text-2xl text-marble-white">{account?.data.name}</h1>
            {account?.address ? (
              <div className="flex flex-row text-sm text-concrete items-center space-x-1">
                <a
                  className="text-base text-concrete inline"
                  href={`https://etherscan.io/address/${account?.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @{getWalletString(account?.address)}
                </a>
                <a
                  href={`https://etherscan.io/address/${account.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLinkIcon className="h-4 w-4 hover:stroke-concrete cursor-pointer" />
                </a>
                <span className="self-start mt-[6px]">
                  <button
                    className=""
                    onClick={() => {
                      navigator.clipboard.writeText(account?.address || "").then(() => {
                        setIsClipboardAddressCopied(true)
                        setTimeout(() => setIsClipboardAddressCopied(false), 3000)
                      })
                    }}
                  >
                    {isClipboardAddressCopied ? (
                      <>
                        <ClipboardCheckIcon className="h-4 w-4 hover:stroke-concrete cursor-pointer" />
                      </>
                    ) : (
                      <ClipboardIcon className="h-4 w-4 hover:stroke-concrete cursor-pointer" />
                    )}
                  </button>
                  {isClipboardAddressCopied && (
                    <span className="text-[.5rem] uppercase font-bold tracking-wider rounded px-1 absolute text-marble-white bg-wet-concrete">
                      copied!
                    </span>
                  )}
                </span>
              </div>
            ) : (
              <p className="text-base text-concrete">Imported from Discord</p>
            )}
          </div>
          <div className="flex flex-row space-x-4 mt-3">
            {account?.data?.contactURL && (
              <a
                href={account?.data?.contactURL}
                target="_blank"
                className="hover:opacity-70 cursor-pointer"
                rel="noreferrer"
              >
                <Image src={PersonalSiteIcon} alt="Personal Site Icon." width={15} height={15} />
              </a>
            )}
            {account?.data?.twitterUrl && (
              <a
                href={account?.data?.twitterUrl}
                target="_blank"
                className="hover:opacity-70 cursor-pointer"
                rel="noreferrer"
              >
                <Image src={TwitterIcon} alt="Twitter Icon." width={15} height={15} />
              </a>
            )}
            {account?.data?.githubUrl && (
              <a
                href={account?.data?.githubUrl}
                target="_blank"
                className="hover:opacity-70 cursor-pointer"
                rel="noreferrer"
              >
                <Image src={GithubIcon} alt="Github Icon." width={15} height={15} />
              </a>
            )}
            {account?.data?.tiktokUrl && (
              <a
                href={account?.data?.tiktokUrl}
                target="_blank"
                className="hover:opacity-70 cursor-pointer"
                rel="noreferrer"
              >
                <Image src={TikTokIcon} alt="TikTok Icon." width={15} height={15} />
              </a>
            )}
            {account?.data?.instagramUrl && (
              <a
                href={account?.data?.instagramUrl}
                target="_blank"
                className="hover:opacity-70 cursor-pointer"
                rel="noreferrer"
              >
                <Image src={InstagramIcon} alt="Instagram Icon." width={15} height={15} />
              </a>
            )}
          </div>
          <div>
            <p className="text-marble-white text-base mt-4 font-normal">{account?.data.bio}</p>
          </div>
          {activeUser?.address === account?.address ? (
            <button
              onClick={() => router.push("/profile/edit")}
              className="mt-4 p-[0.20rem] border border-marble-white text-marble-white text-base w-full rounded-md hover:bg-wet-concrete cursor-pointer"
            >
              Edit Profile
            </button>
          ) : !account?.address && !activeUser?.discordId && setIsConnectDiscordModalOpen ? (
            <button
              onClick={() => setIsConnectDiscordModalOpen(true)}
              className="mt-4 p-[0.20rem] border border-marble-white text-marble-white text-base w-full rounded-md hover:bg-wet-concrete cursor-pointer"
            >
              Claim Account
            </button>
          ) : null}
        </div>
        <div>
          <ul className="mt-6 ml-8 text-lg space-y-2">
            <li className="group cursor-pointer font-bold">
              <LightBulbIcon
                className={`inline h-6 w-6 mr-5 mb-1 ${
                  router.pathname ===
                  Routes.ProfileHome({ accountAddress: account?.address as string }).pathname
                    ? "fill-marble-white"
                    : "fill-concrete group-hover:fill-light-concrete"
                }`}
              />
              <p
                className={`inline ${
                  router.pathname ===
                  Routes.ProfileHome({ accountAddress: account?.address as string }).pathname
                    ? "text-marble-white font-bold"
                    : "text-concrete group-hover:text-light-concrete font-normal"
                }`}
              >
                <Link href={Routes.ProfileHome({ accountAddress: account?.address as string })}>
                  Proposals
                </Link>
              </p>
            </li>
            <li className="group cursor-pointer font-bold">
              <LibraryIcon
                className={`inline h-6 w-6 mr-5 mb-1 ${
                  router.pathname ===
                  Routes.TerminalsOnProfile({ accountAddress: account?.address as string }).pathname
                    ? "fill-marble-white"
                    : "fill-concrete group-hover:fill-light-concrete"
                }`}
              />
              <p
                className={`inline ${
                  router.pathname ===
                  Routes.TerminalsOnProfile({ accountAddress: account?.address as string }).pathname
                    ? "text-marble-white font-bold"
                    : "text-concrete group-hover:text-light-concrete font-normal"
                }`}
              >
                <Link
                  href={Routes.TerminalsOnProfile({ accountAddress: account?.address as string })}
                >
                  Stations
                </Link>
              </p>
            </li>
          </ul>
        </div>
      </div>
      <div className="h-screen md:col-span-4">{children}</div>
    </div>
  )
}

export default Navigation
