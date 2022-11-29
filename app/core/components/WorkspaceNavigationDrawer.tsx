import { Routes } from "@blitzjs/next"
import Image from "next/image"
import StationLogo from "public/station-letters.svg"
import ExitIcon from "/public/exit-button.svg"
import { Dialog, Transition } from "@headlessui/react"
import { LightBulbIcon, NewspaperIcon, CogIcon } from "@heroicons/react/outline"
import { useRouter } from "next/router"
import { Fragment } from "react"
import useUserHasPermissionOfAddress from "../hooks/useUserHasPermissionOfAddress"
import AccountMediaObject from "./AccountMediaObject"
import { NavigationSidebar } from "./NavigationSidebar"

export const WorkspaceNavigationDrawer = ({ isOpen, setIsOpen, account }) => {
  const router = useRouter()
  const { hasPermissionOfAddress: hasPrivateAccess } = useUserHasPermissionOfAddress(
    account?.address,
    account?.addressType,
    account?.data?.chainId
  )

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed md:hidden inset-0 overflow-hidden z-50" onClose={setIsOpen}>
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
              <div className="pointer-events-auto w-screen max-w-[350px]">
                <div className="flex h-full w-full flex-col overflow-y-scroll bg-tunnel-black border-r border-concrete">
                  <div className="w-full flex flex-row justify-between mb-4 mt-4 px-3">
                    <div className="cursor-pointer">
                      <button
                        onClick={() => {
                          router.push(Routes.Home({}))
                          setIsOpen(false)
                        }}
                      >
                        <Image src={StationLogo} alt="Station logo" height={30} width={80} />
                      </button>
                    </div>
                    <button className="w-5 h-5" tabIndex={1} onClick={() => setIsOpen(false)}>
                      <Image src={ExitIcon} alt="Exit icon" width={15} height={15} />
                    </button>
                  </div>
                  <div className="h-full w-full flex flex-row border-t border-concrete">
                    <NavigationSidebar toggleMobileSidebar={setIsOpen} />
                    <ul className="mx-3 space-y-2 w-full">
                      <div className="py-6 border-b border-wet-concrete space-y-6">
                        {/* PROFILE */}
                        {account ? (
                          <button
                            onClick={() => {
                              router.push(
                                Routes.WorkspaceHome({ accountAddress: account?.address as string })
                              )
                              setIsOpen(false)
                            }}
                          >
                            <AccountMediaObject account={account} showActionIcons={true} href="#" />
                          </button>
                        ) : (
                          // LOADING STATE
                          <div
                            tabIndex={0}
                            className={`h-10 w-full rounded-4xl flex flex-row bg-wet-concrete shadow border-solid motion-safe:animate-pulse`}
                          />
                        )}
                      </div>
                      {/* PROPOSALS */}
                      <li
                        className={`p-2 rounded flex flex-row items-center space-x-2 cursor-pointer ${
                          router.pathname ===
                            Routes.WorkspaceHome({ accountAddress: account?.address as string })
                              .pathname && "bg-wet-concrete"
                        }`}
                        onClick={() => {
                          router.push(
                            Routes.WorkspaceHome({ accountAddress: account?.address as string })
                          )
                          setIsOpen(false)
                        }}
                      >
                        <LightBulbIcon className="h-5 w-5 text-white cursor-pointer" />
                        <span>Proposals</span>
                      </li>
                      {/* RFPS */}
                      <li
                        className={`p-2 rounded flex flex-row items-center space-x-2 cursor-pointer ${
                          router.pathname ===
                            Routes.WorkspaceRfps({ accountAddress: account?.address as string })
                              .pathname && "bg-wet-concrete"
                        }`}
                        onClick={() => {
                          router.push(
                            Routes.WorkspaceRfps({ accountAddress: account?.address as string })
                          )
                          setIsOpen(false)
                        }}
                      >
                        <NewspaperIcon className="h-5 w-5 text-white cursor-pointer" />
                        <span>RFPs</span>
                      </li>
                      {hasPrivateAccess && (
                        <li
                          className={`p-2 rounded flex flex-row items-center space-x-2 cursor-pointer ${
                            router.pathname ===
                              Routes.WorkspaceSettings({
                                accountAddress: account?.address as string,
                              }).pathname && "bg-wet-concrete"
                          }`}
                          onClick={() => {
                            router.push(
                              Routes.WorkspaceSettings({
                                accountAddress: account?.address as string,
                              })
                            )
                            setIsOpen(false)
                          }}
                        >
                          <CogIcon className="h-5 w-5 text-white cursor-pointer" />
                          <span>Settings</span>
                        </li>
                      )}
                    </ul>
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

export default WorkspaceNavigationDrawer
