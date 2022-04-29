import StationLogo from "public/station-letters.svg"
import { Image, useQuery } from "blitz"
import { useAccount } from "wagmi"
import useStore from "../hooks/useStore"
import truncateString from "../utils/truncateString"
import { useMemo, useState } from "react"
import ProfileNavigationDrawer from "./ProfileNavigationDrawer"
import getTerminalsByAccount, { TerminalMetadata } from "app/terminal/queries/getTerminalsByAccount"
/**
 * TODO: Rename component + folder structure
 */
const TerminalsNavigation = ({ children }: { children?: any }) => {
  const { data: accountData } = useAccount()
  const activeUser = useStore((state) => state.activeUser)
  const address = useMemo(() => accountData?.address || undefined, [accountData?.address])
  const [profileNavDrawerIsOpen, setProfileNavDrawerIsOpen] = useState<boolean>(false)

  const [usersTerminals] = useQuery(
    getTerminalsByAccount,
    { accountId: activeUser?.id as number },
    { suspense: false, enabled: !!activeUser?.id }
  )

  const handlePfpClick = () => {
    if (address || activeUser) {
      setProfileNavDrawerIsOpen(true)
    }
  }

  const profilePfp =
    activeUser && activeUser.data?.pfpURL ? (
      <>
        {address && (
          <div className="text-xs text-light-concrete flex mb-1">
            <p>{truncateString(address, 3)}</p>
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
    ) : address ? (
      <>
        <div className="text-xs text-light-concrete flex mb-1">
          <p>{truncateString(address, 3)}</p>
          <div className="h-1 w-1 bg-magic-mint rounded-full align-middle ml-[0.1rem] mt-[.35rem]" />
        </div>
        <div
          tabIndex={0}
          className="rounded-full w-[46px] h-[46px] bg-gradient-to-b from-electric-violet to-magic-mint border border-marble-white mx-auto cursor-pointer"
        ></div>
      </>
    ) : (
      <div
        tabIndex={0}
        className="rounded-full w-[46px] h-[46px] bg-wet-concrete border border-concrete mx-auto"
      ></div>
    )

  const TerminalsView = () =>
    activeUser
      ? usersTerminals?.map((terminal, idx) => (
          <div className="cursor-pointer" key={`${terminal.handle}${idx}`}>
            <img
              key={`${terminal?.handle + idx}`}
              src={(terminal?.data as TerminalMetadata)?.pfpURL}
              className="w-[46px] h-[46px] bg-wet-concrete border border-concrete rounded-lg mx-auto mb-4"
            />
          </div>
        )) || null
      : Array.apply(null, Array(3)).map((idx) => (
          <div
            key={idx}
            className="w-[46px] h-[46px] bg-wet-concrete border border-concrete rounded-lg mx-auto"
          />
        ))

  return (
    <>
      <ProfileNavigationDrawer
        isOpen={profileNavDrawerIsOpen}
        setIsOpen={setProfileNavDrawerIsOpen}
      />
      <div className="h-screen w-[70px] bg-tunnel-black border-r border-concrete fixed text-center">
        <a className="mt-1 inline-block" href="https://www.station.express/">
          <Image src={StationLogo} alt="Station logo" height={20} width={54} />
        </a>
        <div className="h-full mt-4">
          <div className="space-y-3">
            <TerminalsView />
          </div>
          <div className="fixed bottom-[10px] left-[10px]" onClick={() => handlePfpClick()}>
            {profilePfp}
          </div>
        </div>
      </div>
      <div className="h-screen left-[70px] relative">{children}</div>
    </>
  )
}

export default TerminalsNavigation
