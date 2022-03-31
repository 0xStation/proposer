import { useParam } from "blitz"
import { Link, Routes, useRouter, useQuery } from "blitz"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"

const Navigation = ({ children }: { children?: any }) => {
  // casting type as string to avoid the "undefined" type which could happen
  // but we will catch that at the terminal query level
  const terminalHandle = useParam("terminalHandle", "string") as string
  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })

  const router = useRouter()

  const navView = terminal ? (
    <div>
      <img
        className="w-full h-[185px] object-cover object-no-repeat object-[0,38%]"
        src={terminal.data.coverURL}
      />
      <div className="bg-tunnel-black min-h-[calc(100vh-15rem)] h-[1px] relative">
        <div className="grid gap-0 grid-cols-1 md:grid-cols-3 xl:grid-cols-4 max-w-screen-xl h-full mx-auto">
          <div className="col-span-1 pl-4 text-2xl border-concrete border-b pb-12 md:border-b-0 md:border-r pr-4 md:pr-6 h-full">
            <div className="flex items-center mt-12">
              <div className="mr-4 max-w-[52px]">
                <img
                  src={terminal.data.pfpURL}
                  alt="PFP"
                  className="h-[52px] min-w-[52px] border border-marble-white rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl text-marble-white">{terminal.data.name}</h1>
                <span className="text-base text-concrete">@{terminal.handle}</span>
              </div>
            </div>
            <h3 className="text-marble-white text-base mt-6">{terminal.data.description}</h3>
            <ul className="mt-9 text-lg">
              <li
                className={`${
                  router.pathname === Routes.TerminalInitiativePage({ terminalHandle }).pathname
                    ? "text-marble-white font-bold"
                    : "text-concrete"
                } cursor-pointer hover:text-marble-white`}
              >
                <Link href={Routes.TerminalInitiativePage({ terminalHandle })}>
                  &#8594; Initiative Board
                </Link>
              </li>
              <li
                className={`${
                  router.pathname === Routes.TerminalContributorsPage({ terminalHandle }).pathname
                    ? "text-marble-white font-bold"
                    : "text-concrete"
                } cursor-pointer hover:text-marble-white`}
              >
                <Link href={Routes.TerminalContributorsPage({ terminalHandle })}>
                  &#8594; Contributor Directory
                </Link>
              </li>
              <li
                className={`${
                  router.pathname === Routes.TerminalWaitingPage({ terminalHandle }).pathname
                    ? "text-marble-white font-bold"
                    : "text-concrete"
                } cursor-pointer hover:text-marble-white`}
              >
                <Link href={Routes.TerminalWaitingPage({ terminalHandle })}>
                  &#8594; Waiting Room
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-2 xl:col-span-3 px-6 pb-12">
            <div className="mt-12">{children}</div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-screen text-center grid place-content-center text-marble-white">
      ...Loading.
    </div>
  )

  return navView
}

export default Navigation
