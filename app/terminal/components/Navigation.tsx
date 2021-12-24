import { useParam } from "blitz"
import { Link, Routes, useRouter } from "blitz"

const Navigation = ({ children }: { children?: any }) => {
  // can use this to eventually fetch the terminal data
  // and replace the placeholders below
  const terminalName = useParam("terminalName", "string") || ""
  const router = useRouter()

  return (
    <div
      className="w-full h-full bg-cover bg-center bg-no-repeat border"
      style={{ backgroundImage: "url('/station-cover.png')" }}
    >
      <div className="bg-tunnel-black min-h-[calc(100vh-15rem)] h-[1px] mt-36">
        <div className="grid gap-0 grid-cols-1 md:grid-cols-3 xl:grid-cols-4 max-w-screen-xl h-full mx-auto">
          <div className="col-span-1 pl-4 text-2xl border-concrete border-b pb-12 md:border-b-0 md:border-r md:pr-6 h-full">
            <div className="flex items-center mt-12">
              <span className="border border-marble-white rounded-full h-12 w-12 mr-4 bg-concrete"></span>
              <div className="flex flex-col">
                <h1 className="text-2xl text-marble-white">{terminalName}</h1>
                <span className="text-sm text-concrete">@station</span>
              </div>
            </div>
            <h3 className="text-marble-white text-sm mt-6">
              Building the infrastructure to empower the next billion contributors in web3.
            </h3>
            <ul className="mt-9 text-lg">
              <li
                className={`${
                  router.pathname === Routes.TerminalInitiativePage({ terminalName }).pathname
                    ? "text-marble-white"
                    : "text-concrete"
                } cursor-pointer hover:text-marble-white`}
              >
                <Link href={Routes.TerminalInitiativePage({ terminalName })}>
                  &#8594; Initiative Board
                </Link>
              </li>
              <li
                className={`${
                  router.pathname === Routes.TerminalContributorsPage({ terminalName }).pathname
                    ? "text-marble-white"
                    : "text-concrete"
                } cursor-pointer hover:text-marble-white`}
              >
                <Link href={Routes.TerminalContributorsPage({ terminalName })}>
                  &#8594; Contributor Directory
                </Link>
              </li>
              <li
                className={`${
                  router.pathname === Routes.TerminalWaitingPage({ terminalName }).pathname
                    ? "text-marble-white"
                    : "text-concrete"
                } cursor-pointer hover:text-marble-white`}
              >
                <Link href={Routes.TerminalWaitingPage({ terminalName })}>
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
  )
}

export default Navigation
