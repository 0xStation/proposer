import StationLogo from "public/station-letters.svg"
import { useEffect } from "react"
import { Image, invoke, Routes, useParam, useQuery, useRouter, useSession } from "blitz"
import { useAccount } from "wagmi"
import useStore from "../hooks/useStore"
import truncateString from "../utils/truncateString"
import { useMemo, useState } from "react"
import ProfileNavigationDrawer from "./ProfileNavigationDrawer"
import getTerminalsByAccount, { TerminalMetadata } from "app/terminal/queries/getTerminalsByAccount"
import getAccountByAddress from "app/account/queries/getAccountByAddress"

const Navigation = ({ children }: { children?: any }) => {
  const session = useSession({ suspense: false })
  const { data: accountData } = useAccount()
  const activeUser = useStore((state) => state.activeUser)
  const setActiveUser = useStore((state) => state.setActiveUser)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const address = useMemo(() => accountData?.address || undefined, [accountData?.address])
  const [profileNavDrawerIsOpen, setProfileNavDrawerIsOpen] = useState<boolean>(false)

  // If the user connects + signs their wallet,
  // set the active user. The active user will be
  // set to `null` if there isn't an existing account.
  useEffect(() => {
    if (session?.siwe?.address && !activeUser) {
      const setActiveAccount = async () => {
        const account = await invoke(getAccountByAddress, { address: session?.siwe?.address })
        setActiveUser(account)
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
          />
        </div>
        <div className="text-xs text-light-concrete flex mt-1">
          <p>{truncateString(session?.siwe?.address, 3)}</p>
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
          <p>{truncateString(session?.siwe?.address, 3)}</p>
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
      {/* Need a parent element around the banner or else there's a chance for a hydration issue and the dom rearranges */}
      <div>
        {!session?.siwe?.address && (
          <div className="w-full h-14 absolute z-10 bg-concrete bottom-0">
            <div className="fixed right-0 mt-3">
              <p className="inline-block mr-5 italic">
                {!address ? "Join the ride →" : "Sign in with ethereum →"}
              </p>
              <button
                onClick={() => toggleWalletModal(true)}
                className="inline mr-10  bg-magic-mint text-tunnel-black w-48 rounded align-middle p-1 hover:bg-opacity-70"
              >
                {!address ? "Connect Wallet" : "Sign"}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="h-screen w-[70px] bg-tunnel-black border-r border-concrete fixed top-0 left-0 text-center flex flex-col">
        {/* hardcoding the link for now - we don't have access to the window object unless we pass it via 
        serverside props through the `Layout` component on every page */}
        <a className="mt-1 inline-block" href="https://app.station.express">
          <Image src={StationLogo} alt="Station logo" height={20} width={54} />
        </a>
        <div className="h-full mt-4">
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
          isTerminalSelected ? "scale-100" : "scale-0"
        } group-hover:scale-100 absolute w-[3px] h-[46px] min-w-max left-0 rounded-r-lg inline-block mr-2 mb-4
    bg-marble-white
    transition-all duration-200 origin-left`}
      />
      <button
        className={`${
          isTerminalSelected ? "border-marble-white" : "border-wet-concrete"
        } inline-block overflow-hidden bg-wet-concrete w-[46px] h-[46px] cursor-pointer border group-hover:border-marble-white rounded-lg mb-4`}
        onClick={() => router.push(Routes.MemberDirectoryPage({ terminalHandle: terminal.handle }))}
      >
        <img src={(terminal?.data as TerminalMetadata)?.pfpURL} />
      </button>
    </div>
  )
}

export default Navigation
