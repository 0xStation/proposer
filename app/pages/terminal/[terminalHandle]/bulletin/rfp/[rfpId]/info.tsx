import truncateString from "app/core/utils/truncateString"
import { BlitzPage, Routes, useParam, useQuery, Link, useRouter } from "blitz"
import Layout from "app/core/layouts/Layout"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import RFPHeaderNavigation from "app/rfp/components/RFPHeaderNavigation"
import getRfpById from "app/rfp/queries/getRfpById"
import { formatDate } from "app/core/utils/formatDate"

const RFPInfoTab: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const rfpId = useParam("rfpId") as string
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle as string },
    { suspense: false, enabled: !!terminalHandle }
  )
  const [rfp] = useQuery(getRfpById, { id: rfpId }, { suspense: false, enabled: !!rfpId })
  const router = useRouter()

  return (
    <Layout title={`${terminal?.data?.name ? terminal?.data?.name + " | " : ""}Bulletin`}>
      <TerminalNavigation>
        <RFPHeaderNavigation rfpId={rfpId} />
        <div className="h-[calc(100vh-240px)] flex flex-row">
          <div className="w-full">{/* markdown */}</div>
          <div className="w-96 border-l border-concrete pl-6 pt-6 pr-16 flex-col">
            <div className="mt-2">
              <p className="text-concrete uppercase text-xs font-bold">Start Date</p>
              <p className="mt-2">{formatDate(rfp?.startDate)}</p>
            </div>
            <div className="mt-6">
              <p className="text-concrete uppercase text-xs font-bold">End Date</p>
              <p className="mt-2">{(rfp?.endDate && formatDate(rfp?.endDate)) || "N/A"}</p>
            </div>
            {/* TODO: make dynamic  */}
            <div className="mt-6">
              <p className="text-concrete uppercase text-xs font-bold">Total Funding</p>
              <p className="mt-2">100.00 ETH</p>
              <p>1,500,000.00 USDC</p>
            </div>
            <div className="mt-6">
              <p className="text-concrete uppercase text-xs font-bold">Creator</p>
              <PfpComponent user={rfp?.author} className="mt-2" />
            </div>
            <div className="mt-9">
              <p className="text-xs text-concrete uppercase font-bold">Signers</p>
              <div className="flex flex-row mt-4">
                <div className="flex flex-col content-center align-middle mr-3">
                  <img
                    src={
                      "https://cdn.discordapp.com/avatars/658010922043834400/77cb4d63757cc5cc70173e30b84ca867.png"
                    }
                    alt="PFP"
                    className="min-w-[46px] max-w-[46px] h-[46px] rounded-full cursor-pointer border border-wet-concrete"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_PFP_URLS.USER
                    }}
                  />
                </div>
                <div className="flex flex-col content-center">
                  <div className="flex flex-row items-center space-x-1">
                    <p className="text-base text-marble-white font-bold">Izzy</p>
                  </div>
                  <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
                    <p className="w-max truncate leading-4">
                      @{truncateString("0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex mt-4 flex-row">
                <div className="flex flex-col content-center align-middle mr-3">
                  <img
                    src={""}
                    alt="PFP"
                    className="min-w-[46px] max-w-[46px] h-[46px] rounded-full cursor-pointer border border-wet-concrete"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_PFP_URLS.USER
                    }}
                  />
                </div>
                <div className="flex flex-col content-center">
                  <div className="flex flex-row items-center space-x-1">
                    <p className="text-base text-marble-white font-bold">Pepe</p>
                  </div>
                  <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
                    <p className="w-max truncate leading-4">
                      @{truncateString("0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex mt-4 flex-row">
                <div className="flex flex-col content-center align-middle mr-3">
                  <img
                    src={""}
                    alt="PFP"
                    className="min-w-[46px] max-w-[46px] h-[46px] rounded-full cursor-pointer border border-wet-concrete"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_PFP_URLS.USER
                    }}
                  />
                </div>
                <div className="flex flex-col content-center">
                  <div className="flex flex-row items-center space-x-1">
                    <p className="text-base text-marble-white font-bold">Pepe</p>
                  </div>
                  <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
                    <p className="w-max truncate leading-4">
                      @{truncateString("0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TerminalNavigation>
    </Layout>
  )
}

const PfpComponent = ({ user, className = "" }) => {
  return (
    <Link href={Routes.ProfileHome({ accountAddress: user?.address })}>
      <div className={`flex flex-row ${className}`}>
        <div className="flex flex-col content-center align-middle mr-3">
          <img
            src={user?.data?.pfpURL}
            alt="PFP"
            className="min-w-[46px] max-w-[46px] h-[46px] rounded-full cursor-pointer border border-wet-concrete"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_PFP_URLS.USER
            }}
          />
        </div>
        <div className="flex flex-col content-center">
          <div className="flex flex-row items-center space-x-1">
            <p className="text-base text-marble-white font-bold">{user?.data?.name}</p>
          </div>
          <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
            <p className="w-max truncate leading-4">@{truncateString(user?.address)}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
export default RFPInfoTab
