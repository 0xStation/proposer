import { useMemo } from "react"
import { useParam } from "blitz"
import { Link, Routes, useRouter, useQuery } from "blitz"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import useStore from "app/core/hooks/useStore"
import { useAccount, useBalance } from "wagmi"
import TicketWrapper from "app/core/components/TicketWrapper"
import { useDecimals } from "app/core/contracts/contracts"
import { TERMINAL, DEFAULT_NUMBER_OF_DECIMALS } from "app/core/utils/constants"
import { Account } from "app/account/types"

const Navigation = ({ children }: { children?: any }) => {
  // casting type as string to avoid the "undefined" type which could happen
  // but we will catch that at the terminal query level
  const terminalHandle = useParam("terminalHandle", "string") as string
  // I was getting a weird error that suspense was not supported by react-dom so I had to disable it.
  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })
  const router = useRouter()
  const activeUser: Account | null = useStore((state) => state.activeUser)

  const [{ data: accountData }] = useAccount({
    fetchEns: true,
  })
  const address = useMemo(() => accountData?.address || undefined, [accountData?.address])
  const { decimals = DEFAULT_NUMBER_OF_DECIMALS } = useDecimals()
  const [{ data: balanceData }] = useBalance({
    addressOrName: address,
    token: TERMINAL.TOKEN_ADDRESS,
    watch: true,
    formatUnits: decimals,
  })
  const tokenBalance = parseFloat(balanceData?.formatted || "0").toFixed(1)

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
        {activeUser && <TicketWrapper activeUser={activeUser} tokenBalance={tokenBalance} />}
      </div>
    </div>
  )
}

export default Navigation
