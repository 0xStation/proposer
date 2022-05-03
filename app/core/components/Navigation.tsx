import StationLogo from "public/station-letters.svg"
import { useEffect } from "react"
import { Image, invoke, useQuery, useSession } from "blitz"
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
  const isAccountConnected = activeUser && session?.siwe?.address

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
  // 3. else don't render anything
  const profilePfp =
    isAccountConnected && activeUser.data?.pfpURL ? (
      <>
        {session?.siwe?.address && (
          <div className="text-xs text-light-concrete flex mb-1">
            <p>{truncateString(session?.siwe?.address, 3)}</p>
            <div className="h-1 w-1 bg-magic-mint rounded-full align-middle ml-[0.1rem] mt-[.35rem]" />
          </div>
        )}
        <div tabIndex={0} className="mx-auto">
          <img
            src={activeUser.data.pfpURL}
            alt="PFP"
            className={"w-[46px] h-[46px] border border-marble-white rounded-full cursor-pointer"}
          />
        </div>
      </>
    ) : session?.siwe?.address ? (
      <>
        <div className="text-xs text-light-concrete flex mb-1">
          <p>{truncateString(session?.siwe?.address, 3)}</p>
          <div className="h-1 w-1 bg-magic-mint rounded-full align-middle ml-[0.1rem] mt-[.35rem]" />
        </div>
        <div
          tabIndex={0}
          className="rounded-full w-[46px] h-[46px] bg-gradient-to-b from-electric-violet to-magic-mint border border-marble-white mx-auto cursor-pointer"
        ></div>
      </>
    ) : null

  const terminalsView =
    isAccountConnected && Array.isArray(usersTerminals) && usersTerminals?.length > 0
      ? usersTerminals?.map((terminal, idx) => (
          <div className="cursor-pointer" key={`${terminal.handle}${idx}`}>
            <img
              key={`${terminal?.handle + idx}`}
              src={(terminal?.data as TerminalMetadata)?.pfpURL}
              className="w-[46px] h-[46px] bg-wet-concrete border border-concrete rounded-lg mx-auto mb-4"
            />
          </div>
        ))
      : null

  return (
    <>
      <ProfileNavigationDrawer
        isOpen={profileNavDrawerIsOpen}
        setIsOpen={setProfileNavDrawerIsOpen}
      />
      {/* TODO: remove this parent div later. Need a parent element around the banner or else the dom rearranges for some reason */}
      <div>
        {!address || !session?.siwe?.address ? (
          <div className="w-full h-14 absolute z-10 bg-concrete bottom-0">
            <div className="fixed right-0 mt-3">
              <p className="inline-block mr-5 italic">
                {!address ? "Join the ride →" : "Sign in with ethereum →"}
              </p>
              <button
                onClick={() => toggleWalletModal(true)}
                // disable={}
                className="inline mr-10  bg-magic-mint text-tunnel-black w-48 rounded align-middle p-1 hover:bg-opacity-70"
              >
                {!address ? "Connect Wallet" : "Sign"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
      <div className="h-screen w-[70px] bg-tunnel-black border-r border-concrete fixed text-center">
        <a className="mt-1 inline-block" href="https://www.station.express/">
          <Image src={StationLogo} alt="Station logo" height={20} width={54} />
        </a>
        <div className="h-full mt-4">
          {terminalsView}
          {profilePfp && (
            <div className="fixed bottom-[10px] left-[10px]" onClick={() => handlePfpClick()}>
              {profilePfp}
            </div>
          )}
        </div>
      </div>
      <div className="h-screen left-[70px] relative">{children}</div>
    </>
  )
}

export default Navigation
