import { Fragment, useState } from "react"
import { useParam, useQuery, useRouter, Routes, Link, Image } from "blitz"
import Exit from "/public/exit-button.svg"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import SettingsIcon from "app/core/icons/SettingsIcon"
import { Dialog, Transition } from "@headlessui/react"

const Navigation = ({ children }) => {
  const terminalHandle = useParam("terminalHandle") as string
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle as string },
    { suspense: false, enabled: !!terminalHandle }
  )
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState<boolean>(false)
  const router = useRouter()

  const navigationContent = (
    <>
      <div className="fixed mt-5 sm:mt-0">
        <Link href={Routes.MemberDirectoryPage({ terminalHandle })}>
          <label className="font-bold text-sm text-marble-white uppercase tracking-wider cursor-pointer">
            {terminal?.data.name || terminalHandle}
          </label>
        </Link>

        <ul className="mt-6">
          <li
            className={`${
              router.pathname === Routes.TerminalSettingsPage({ terminalHandle }).pathname
                ? "text-marble-white font-bold"
                : "text-concrete"
            } cursor-pointer hover:text-marble-white`}
          >
            <Link href={Routes.TerminalSettingsPage({ terminalHandle })}>Overview</Link>
          </li>
          <li
            className={`${
              router.pathname === Routes.CheckbookSettingsPage({ terminalHandle }).pathname ||
              router.pathname === Routes.NewCheckbookSettingsPage({ terminalHandle }).pathname
                ? "text-marble-white font-bold"
                : "text-concrete"
            } cursor-pointer hover:text-marble-white mt-4`}
          >
            <Link href={Routes.CheckbookSettingsPage({ terminalHandle })}>Checkbook™</Link>
          </li>
          <li
            className={`${
              router.pathname === Routes.TokenSettingsPage({ terminalHandle }).pathname ||
              router.pathname === Routes.NewTokenSettingsPage({ terminalHandle }).pathname
                ? "text-marble-white font-bold"
                : "text-concrete"
            } cursor-pointer hover:text-marble-white mt-4`}
          >
            <Link href={Routes.TokenSettingsPage({ terminalHandle })}>Tokens</Link>
          </li>
        </ul>

        <label className="font-bold text-sm text-marble-white uppercase tracking-wider mt-8 block">
          Integrations
        </label>
        <ul className="mt-6">
          <li
            className={`${
              router.pathname === Routes.DiscordSettingsPage({ terminalHandle }).pathname
                ? "text-marble-white font-bold"
                : "text-concrete"
            } cursor-pointer hover:text-marble-white`}
          >
            <Link href={Routes.DiscordSettingsPage({ terminalHandle })}>Discord</Link>
          </li>
        </ul>
        {
          // show dev tools if on localhost
          typeof window !== "undefined" && window.location.hostname === "localhost" && (
            <>
              <label className="font-bold text-sm text-marble-white uppercase tracking-wider mt-8 block">
                Dev Tools
              </label>
              <ul className="mt-6">
                <li
                  className={`${
                    router.pathname === Routes.PlaygroundPage({ terminalHandle }).pathname
                      ? "text-marble-white font-bold"
                      : "text-concrete"
                  } cursor-pointer hover:text-marble-white mt-4`}
                >
                  <Link href={Routes.PlaygroundPage({ terminalHandle })}>Playground</Link>
                </li>
              </ul>
            </>
          )
        }
      </div>
    </>
  )

  const mobileNavigationDrawer = (
    <Transition.Root show={isMobileNavigationOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 overflow-hidden block sm:hidden z-50"
        onClose={setIsMobileNavigationOpen}
      >
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

          <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-[200px]">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="pointer-events-auto w-screen max-w-xs">
                <div className="flex h-full flex-col overflow-y-scroll bg-tunnel-black border-r border-concrete px-4">
                  <button
                    className="mt-4 text-right"
                    onClick={() => setIsMobileNavigationOpen(false)}
                  >
                    <Image src={Exit} alt="Close button" width={12} height={12} />
                  </button>
                  {navigationContent}
                  <div className="fixed bottom-6 left-6">
                    <Link href={Routes.MemberDirectoryPage({ terminalHandle })}>
                      Back to Members
                    </Link>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )

  return (
    <div className="text-marble-white min-h-screen flex flex-row">
      <div
        className="fixed bottom-5 right-5 z-10 rounded-full bg-concrete p-3 sm:hidden"
        onClick={() => setIsMobileNavigationOpen(!isMobileNavigationOpen)}
      >
        <SettingsIcon width={25} height={25} />
      </div>
      <div className="absolute top-4 left-4 cursor-pointer hidden sm:block">
        <Link href={Routes.MemberDirectoryPage({ terminalHandle })}>
          <Image src={Exit} alt="Close button" width={12} height={12} />
        </Link>
      </div>
      <nav className="w-[300px] border-r border-concrete p-6 ml-[70px] hidden sm:block">
        {navigationContent}
      </nav>
      {mobileNavigationDrawer}
      <main className="flex-1">{children}</main>
    </div>
  )
}

export default Navigation
