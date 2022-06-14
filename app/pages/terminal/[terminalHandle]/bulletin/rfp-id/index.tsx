import truncateString from "app/core/utils/truncateString"
import { BlitzPage, Routes, useParam, useQuery, Link, useRouter } from "blitz"
import Layout from "app/core/layouts/Layout"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import RFPHeaderNavigation from "app/rfp/components/RFPHeaderNavigation"

const RequestForProposalBulletinInfoPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle as string },
    { suspense: false, enabled: !!terminalHandle }
  )
  const router = useRouter()
  return (
    <Layout title={`${terminal?.data?.name ? terminal?.data?.name + " | " : ""}Bulletin`}>
      <TerminalNavigation>
        <RFPHeaderNavigation />
        <div className="h-[calc(100vh-240px)] flex flex-row">
          <div className="w-full">{/* markdown */}</div>
          <div className="w-96 border-l border-concrete pl-6 pt-6 pr-16 flex-col">
            <div>
              <p className="text-concrete uppercase text-xs font-bold">RFP-ID</p>
              <p className="mt-2">RFP-1</p>
            </div>
            <div className="mt-6">
              <p className="text-concrete uppercase text-xs font-bold">Start Date</p>
              <p className="mt-2">8-JUN-2022</p>
            </div>
            <div className="mt-6">
              <p className="text-concrete uppercase text-xs font-bold">End Date</p>
              <p className="mt-2">8-JUN-2022</p>
            </div>
            <div className="mt-6">
              <p className="text-concrete uppercase text-xs font-bold">Total Funding</p>
              <p className="mt-2">100.00 ETH</p>
              <p>1,500,000.00 USDC</p>
            </div>
            <div className="mt-6">
              <p className="text-concrete uppercase text-xs font-bold">Creator</p>
              <div className="flex flex-row">
                <div className="flex flex-col content-center align-middle mr-3 mt-2">
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
                <div className="flex flex-col content-center mt-2">
                  <div className="flex flex-row items-center space-x-1">
                    <p className="text-base text-marble-white font-bold">Izzy</p>
                  </div>
                  <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
                    <p className="w-max truncate leading-4">
                      @{truncateString("0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13", 3)}
                    </p>
                  </div>
                </div>
              </div>
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
export default RequestForProposalBulletinInfoPage
