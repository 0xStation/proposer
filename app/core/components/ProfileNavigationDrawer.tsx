import { Dialog, Transition } from "@headlessui/react"
import { Fragment, useMemo } from "react"
import { Image, useRouter, invoke, useSession, Link, Routes } from "blitz"
import Exit from "public/exit-button.svg"
import truncateString from "../utils/truncateString"
import { useAccount, useDisconnect } from "wagmi"
import useStore from "../hooks/useStore"
import logout from "app/session/mutations/logout"

export const ProfileNavigationDrawer = ({ isOpen, setIsOpen }) => {
  const router = useRouter()
  const session = useSession({ suspense: false })
  const { data: accountData } = useAccount()
  const { disconnect } = useDisconnect()
  const activeUser = useStore((state) => state.activeUser)
  const setActiveUser = useStore((state) => state.setActiveUser)
  const address = useMemo(() => accountData?.address || undefined, [accountData?.address])

  const handleDisconnect = async () => {
    setIsOpen(false)
    setActiveUser(null)
    await invoke(logout, {})
    disconnect()
  }

  const profileLinkOption =
    session?.siwe?.address && activeUser ? (
      <button
        className="block hover:opacity-70"
        onClick={() => router.push(`/profile/${activeUser?.address}`)}
      >
        View Profile
      </button>
    ) : session?.siwe?.address ? (
      <button className="block hover:opacity-70" onClick={() => router.push(`/profile/create`)}>
        Create Profile
      </button>
    ) : null

  const profilePfp =
    activeUser && activeUser.data?.pfpURL ? (
      <>
        <div tabIndex={0} className="mx-auto">
          <div className="h-3 w-3 border border-tunnel-black bg-magic-mint rounded-full absolute ml-[2.15rem]" />
          <img
            src={activeUser.data.pfpURL}
            alt="PFP"
            className={"w-[46px] h-[46px] rounded-full cursor-pointer"}
          />
        </div>
      </>
    ) : (
      <>
        <div className="h-3 w-3 border border-tunnel-black bg-magic-mint rounded-full absolute ml-[2.15rem]" />
        <div
          tabIndex={0}
          className="rounded-full w-[46px] h-[46px] bg-gradient-to-b from-electric-violet to-magic-mint cursor-pointer"
        ></div>
      </>
    )

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 overflow-hidden z-50" onClose={setIsOpen}>
        <div className="absolute inset-0 overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-100"
            enterFrom="opacity-0"
            enterTo="opacity-50"
            leave="ease-in-out duration-100"
            leaveFrom="opacity-50"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="absolute inset-0 bg-tunnel-black bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="pointer-events-auto w-screen max-w-[298px]">
                <div className="flex h-full flex-col overflow-y-scroll bg-tunnel-black border-r border-concrete">
                  <button className="mt-4 mr-4 text-right" onClick={() => setIsOpen(false)}>
                    <Image src={Exit} alt="Close button" width={12} height={12} />
                  </button>
                  <div className="fixed bottom-6 left-6">
                    {profilePfp}
                    {session?.siwe?.address && (
                      <div className="text-xs text-light-concrete flex mt-7 ml-1 mb-1">
                        <p>@{truncateString(session?.siwe?.address)}</p>
                      </div>
                    )}
                    <div className="space-y-2 mt-4">
                      {profileLinkOption}
                      <Link href={Routes.CreateTerminalDetailsPage()}>
                        <span className="block hover:opacity-70 cursor-pointer">
                          Open a Terminal
                        </span>
                      </Link>
                      <button className="block hover:opacity-70" onClick={handleDisconnect}>
                        Disconnect
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default ProfileNavigationDrawer
