import useStore from "app/core/hooks/useStore"
import { getWalletString } from "app/utils/getWalletString"
import { useRouter, Image } from "blitz"
import TerminalIcon from "public/terminal-icon.svg"
import LockedIcon from "public/locked-icon.svg"
import GithubIcon from "public/github-icon.svg"
import TwitterIcon from "public/twitter-icon.svg"
import PersonalSiteIcon from "public/personal-site-icon.svg"
import InstagramIcon from "public/instagram-icon.svg"
import TikTokIcon from "public/tiktok-icon.svg"
import { Terminal } from "app/terminal/types"
import { Account } from "app/account/types"

export const Navigation = ({
  account,
  terminals,
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

  return (
    <div className="grid md:grid-cols-5">
      <div className="md:h-screen bg-tunnel-black border-r border-concrete md:col-span-1">
        <div className="h-[150px] relative mb-[116px]">
          {account?.data.coverURL ? (
            <img
              alt="The user's cover photo."
              src={account?.data.coverURL}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="bg-gradient-to-b object-cover from-electric-violet to-magic-mint h-full w-full"></div>
          )}
          {account?.data.pfpURL ? (
            <img
              src={account?.data.pfpURL}
              alt="The user's profile picture."
              className="bg-gradient-to-b from-electric-violet to-magic-mint w-[142px] h-[142px] border-4 border-tunnel-black rounded-full absolute bottom-[-100px] left-0 right-0 mx-auto"
            />
          ) : (
            <div className="bg-gradient-to-b from-electric-violet to-magic-mint w-[142px] h-[142px] border-4 border-tunnel-black rounded-full absolute bottom-[-100px] left-0 right-0 mx-auto"></div>
          )}
        </div>
        <div className="px-8 border-b border-concrete pb-6">
          <div className="flex flex-col">
            <h1 className="text-2xl text-marble-white">{account?.data.name}</h1>
            <span className="text-base text-concrete">
              {account?.address ? `@${getWalletString(account?.address)}` : "Imported from Discord"}
            </span>
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
          <ul className="mt-6 ml-8 text-lg md:space-y-2 md:space-x-0 space-x-8 overflow-x-scroll">
            <li
              className={`cursor-pointer group inline md:block${
                terminals && terminals?.length
                  ? "hover:text-marble-white font-bold"
                  : "text-concrete"
              }`}
            >
              <div className="inline mr-5 align-middle ">
                {terminals && terminals?.length ? (
                  <Image src={TerminalIcon} alt="Member directory icon" />
                ) : (
                  <Image src={LockedIcon} alt="Locked icon" />
                )}
              </div>
              <p className="inline">Terminals</p>
              {!terminals ||
                (!terminals.length && (
                  <span className="group-hover:scale-100 text-xs uppercase font-bold tracking-wider rounded-md p-2 ml-3 absolute text-marble-white bg-wet-concrete sidebar-tooltip transition-all duration-100 scale-0">
                    Coming soon
                  </span>
                ))}
            </li>
            <li className="text-concrete cursor-pointer group inline md:block">
              <div className="inline mr-5 align-middle">
                <Image src={LockedIcon} alt="Locked icon" />
              </div>
              <p className="inline">Proposals</p>
              <span className="group-hover:scale-100 text-xs uppercase font-bold tracking-wider rounded-md p-2 ml-3 absolute text-marble-white bg-wet-concrete sidebar-tooltip transition-all duration-100 scale-0">
                Coming soon
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="h-screen md:col-span-4">{children}</div>
    </div>
  )
}

export default Navigation
