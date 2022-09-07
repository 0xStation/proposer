import StationLogo from "public/station-letters.svg"
import { useEffect } from "react"
import { Image, invoke, Routes, useQuery, useParam, useRouter, useSession } from "blitz"
import { useAccount } from "wagmi"
import useStore from "../hooks/useStore"
import truncateString from "../utils/truncateString"
import { useState } from "react"
import ProfileNavigationDrawer from "./ProfileNavigationDrawer"
import getTerminalsByAccount from "app/terminal/queries/getTerminalsByAccount"
import { TerminalMetadata } from "app/terminal/types"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import createAccount from "app/account/mutations/createAccount"
import { DEFAULT_PFP_URLS } from "../utils/constants"
import ExploreImageIcon from "public/explore.svg"

const Navigation = ({ children }: { children?: any }) => {
  const session = useSession({ suspense: false })
  const activeUser = useStore((state) => state.activeUser)
  const setActiveUser = useStore((state) => state.setActiveUser)
  const [profileNavDrawerIsOpen, setProfileNavDrawerIsOpen] = useState<boolean>(false)
  const router = useRouter()
  // If the user connects + signs their wallet,
  // set the active user. The active user will be
  // set to `null` if there isn't an existing account.
  useEffect(() => {
    if (session?.siwe?.address && !activeUser) {
      const setActiveAccount = async () => {
        const account = await invoke(getAccountByAddress, { address: session?.siwe?.address })
        if (!account) {
          const newUser = await invoke(createAccount, {
            address: session?.siwe?.address,
            createSession: true,
          })
          setActiveUser(newUser)
          router.push(`/profile/complete`)
        } else {
          setActiveUser(account)
        }
      }
      setActiveAccount()
    }
  }, [session?.siwe?.address])

  const [usersTerminals] = useQuery(
    getTerminalsByAccount,
    { accountId: activeUser?.id as number },
    { suspense: false, enabled: !!activeUser?.id }
  )

  const handlePfpClick = () => {
    if (session?.siwe?.address) {
      setProfileNavDrawerIsOpen(true)
    }
  }

  // 1. if user has an active account w/Station + pfp url, render pfp url.
  // 2. else if user has a connected address, render gradient pfp.
  // 3. else don't render anything when user isn't connected.
  const profilePfp =
    session?.siwe?.address && activeUser?.data?.pfpURL ? (
      <>
        <div tabIndex={0} className="mx-auto">
          <div className="h-3 w-3 border border-tunnel-black bg-magic-mint rounded-full absolute right-0 mr-1" />
          <img
            src={activeUser?.data.pfpURL}
            alt="PFP"
            className={"w-[46px] h-[46px] rounded-full cursor-pointer"}
            onError={(e) => {
              e.currentTarget.src = DEFAULT_PFP_URLS.USER
            }}
          />
        </div>
        <div className="text-xs text-light-concrete flex mt-1">
          <p>@{truncateString(session?.siwe?.address, 2)}</p>
        </div>
      </>
    ) : session?.siwe?.address ? (
      <>
        <div className="h-3 w-3 border border-tunnel-black bg-magic-mint rounded-full absolute right-0 mr-1" />
        <div
          tabIndex={0}
          className="rounded-full w-[46px] h-[46px] bg-gradient-to-b from-electric-violet to-magic-mint mx-auto cursor-pointer"
        ></div>
        <div className="text-xs text-light-concrete flex mt-1">
          <p>@{truncateString(session?.siwe?.address, 2)}</p>
        </div>
      </>
    ) : null

  const terminalsView =
    usersTerminals && Array.isArray(usersTerminals) && usersTerminals?.length > 0
      ? usersTerminals?.map((terminal, idx) => (
          <TerminalIcon terminal={terminal} key={`${terminal.handle}${idx}`} />
        ))
      : null

  return (
    <>
      <ProfileNavigationDrawer
        isOpen={profileNavDrawerIsOpen}
        setIsOpen={setProfileNavDrawerIsOpen}
      />
      <div className="h-screen w-[70px] bg-tunnel-black border-r border-concrete fixed top-0 left-0 text-center flex flex-col">
        <a className="mt-1 inline-block" href="https://app.station.express">
          <Image src={StationLogo} alt="Station logo" height={20} width={54} />
        </a>
        <div className="h-full mt-4">
          <ExploreIcon />
          {terminalsView}
          {profilePfp && (
            <div className="fixed bottom-[10px] left-[12px]" onClick={() => handlePfpClick()}>
              {profilePfp}
            </div>
          )}
        </div>
      </div>
      <div className="h-screen ml-[70px] relative">{children}</div>
    </>
  )
}

const TerminalIcon = ({ terminal }) => {
  const terminalHandle = useParam("terminalHandle", "string") as string
  const isTerminalSelected = terminalHandle === terminal.handle
  const router = useRouter()
  return (
    <div className="relative flex items-center justify-center group">
      <span
        className={`${
          isTerminalSelected ? "scale-100" : "scale-0 group-hover:scale-75"
        }  absolute w-[3px] h-[46px] min-w-max left-0 rounded-r-lg inline-block mr-2 mb-4
    bg-marble-white
    transition-all duration-200 origin-left`}
      />
      <button
        className={`${
          isTerminalSelected ? "border-marble-white" : "border-wet-concrete"
        } inline-block overflow-hidden cursor-pointer border group-hover:border-marble-white rounded-lg mb-4`}
        onClick={() => router.push(Routes.BulletinPage({ terminalHandle: terminal.handle }))}
      >
        {(terminal?.data as TerminalMetadata)?.pfpURL ? (
          <img
            className="object-fill w-[46px] h-[46px]"
            src={(terminal?.data as TerminalMetadata)?.pfpURL}
            onError={(e) => {
              e.currentTarget.src = DEFAULT_PFP_URLS.TERMINAL
            }}
          />
        ) : (
          <span className="w-[46px] h-[46px] bg-gradient-to-b  from-neon-blue to-torch-red block rounded-lg" />
        )}
      </button>
    </div>
  )
}

const ExploreIcon = () => {
  const exploreSelected =
    typeof window !== "undefined" &&
    window?.location?.pathname === Routes.ExploreStations().pathname
  const router = useRouter()
  return (
    <div className="relative flex items-center justify-center group">
      <span
        className={`${
          exploreSelected ? "scale-100" : "scale-0 group-hover:scale-75"
        }  absolute w-[3px] h-[46px] min-w-max left-0 rounded-r-lg inline-block mr-2 mb-4
bg-marble-white
transition-all duration-200 origin-left`}
      />
      <button
        className={`${
          exploreSelected ? "border-marble-white" : "border-wet-concrete"
        } inline-block overflow-hidden cursor-pointer border group-hover:border-marble-white rounded-lg h-[47px] mb-4`}
        onClick={() => router.push(Routes.ExploreStations())}
      >
        <Image src={ExploreImageIcon} alt="Explore icon" height={46} width={46} />
      </button>
    </div>
  )
}

export default Navigation