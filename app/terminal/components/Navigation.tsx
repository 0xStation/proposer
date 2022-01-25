import { useParam } from "blitz"
import { Link, Routes, useRouter, useQuery } from "blitz"
import getTerminalById from "app/terminal/queries/getTerminalById"

const Navigation = ({ children }: { children?: any }) => {
  // need a better way of catching undefined here than defaulting to 1
  // it will never happen, but TS doesn't know that
  const terminalId = useParam("terminalId", "number") || 1

  // I was getting a weird error that suspense was not supported by react-dom so I had to disable it.
  const [terminal] = useQuery(getTerminalById, { id: terminalId }, { suspense: false })
  const router = useRouter()

  // obviously need better error page if the terminal is not found, but this will do.
  if (!terminal) {
    return <div className="max-w-screen-xl mx-auto text-marble-white">Terminal not found.</div>
  }

  return (
    <div
      className="w-full h-full bg-cover bg-center bg-no-repeat border"
      style={{ backgroundImage: "url('/station-cover.png')" }}
    >
      <div className="bg-tunnel-black min-h-[calc(100vh-15rem)] h-[1px] mt-36 relative">
        <div className="grid gap-0 grid-cols-1 md:grid-cols-3 xl:grid-cols-4 max-w-screen-xl h-full mx-auto">
          <div className="col-span-1 pl-4 text-2xl border-concrete border-b pb-12 md:border-b-0 md:border-r md:pr-6 h-full">
            <div className="flex items-center mt-12">
              <div className="flex-2/5 mr-4">
                <img
                  src={terminal.data.pfpURL}
                  alt="PFP"
                  className="h-[52px] w-[52px] border border-marble-white rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl text-marble-white">{terminal.data.name}</h1>
                <span className="text-sm text-concrete">@{terminal.data.handle}</span>
              </div>
            </div>
            <h3 className="text-marble-white text-sm mt-6">{terminal.data.description}</h3>
            <ul className="mt-9 text-lg">
              <li
                className={`${
                  router.pathname === Routes.TerminalInitiativePage({ terminalId }).pathname
                    ? "text-marble-white"
                    : "text-concrete"
                } cursor-pointer hover:text-marble-white`}
              >
                <Link href={Routes.TerminalInitiativePage({ terminalId })}>
                  &#8594; Initiative Board
                </Link>
              </li>
              <li
                className={`${
                  router.pathname === Routes.TerminalContributorsPage({ terminalId }).pathname
                    ? "text-marble-white"
                    : "text-concrete"
                } cursor-pointer hover:text-marble-white`}
              >
                <Link href={Routes.TerminalContributorsPage({ terminalId })}>
                  &#8594; Contributor Directory
                </Link>
              </li>
              <li
                className={`${
                  router.pathname === Routes.TerminalWaitingPage({ terminalId }).pathname
                    ? "text-marble-white"
                    : "text-concrete"
                } cursor-pointer hover:text-marble-white`}
              >
                <Link href={Routes.TerminalWaitingPage({ terminalId })}>&#8594; Waiting Room</Link>
              </li>
            </ul>
          </div>
          <div className="col-span-2 xl:col-span-3 px-6 pb-12">
            <div className="mt-12">{children}</div>
          </div>
        </div>
        <img
          className="absolute bottom-4 right-4 h-[300px]"
          src="https://station.nyc3.digitaloceanspaces.com/tickets/station/frog.svg"
        />
      </div>
    </div>
  )
}

export default Navigation
