import { useState } from "react"
import { BlitzPage, Link, Routes, useQuery, useRouter } from "blitz"
import { trackClick } from "app/utils/amplitude"
import { TRACKING_EVENTS } from "app/core/utils/constants"
import Layout from "app/core/layouts/Layout"
import Pagination from "app/core/components/Pagination"
import { RFP_STATUS_DISPLAY_MAP, DEFAULT_PFP_URLS, PAGINATION_TAKE } from "app/core/utils/constants"
import getAllRfps from "app/rfp/queries/getAllRfps"
import getAllTerminals from "app/terminal/queries/getAllTerminals"
import getTerminalMemberCount from "app/accountTerminal/queries/getTerminalMemberCount"
import getRfpCountByTerminalId from "app/rfp/queries/getRfpCountByTerminalId"
import getProposalCountByTerminal from "app/proposal/queries/getProposalCountByTerminal"
import useStore from "app/core/hooks/useStore"
import { canCreateStation, addressHasToken } from "app/core/utils/permissions"
import { DateTime } from "luxon"

const {
  FEATURE: { NEW_STATION },
  PAGE_NAME,
} = TRACKING_EVENTS

const ExploreStations: BlitzPage = () => {
  const activeUser = useStore((state) => state.activeUser)
  const [page, setPage] = useState<number>(0)
  const [tab, setTab] = useState<"STATION" | "RFP">("STATION")
  const router = useRouter()

  const [terminals] = useQuery(
    getAllTerminals,
    { page: page, paginationTake: PAGINATION_TAKE },
    { suspense: false, refetchOnReconnect: false, refetchOnWindowFocus: false }
  )

  const [rfps] = useQuery(
    getAllRfps,
    { page: page, paginationTake: PAGINATION_TAKE },
    {
      suspense: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  )

  const hasToken = addressHasToken(
    activeUser?.address,
    "0x18aAA7115705e8be94bfFEBDE57Af9BFc265B998"
  )
  console.log(hasToken)

  return (
    <Layout title="Explore stations">
      <div className="h-screen">
        <div className="pt-8 pl-8 pb-3 flex flex-row justify-between">
          <div>
            <h1 className="font-bold text-2xl">Explore</h1>
            <p>All stations, find your tribe</p>
          </div>
          <div className="relative self-start group">
            <button
              className="text-tunnel-black bg-electric-violet rounded hover:opacity-70 h-[35px] px-6 mr-8"
              onClick={() => {
                trackClick(NEW_STATION.EVENT_NAME.SHOW_CREATE_STATION_PAGE_CLICKED, {
                  pageName: PAGE_NAME.EXPLORE,
                  userAddress: activeUser?.address,
                })
                router.push(Routes.CreateTerminalDetailsPage())
              }}
              disabled={!canCreateStation(activeUser?.address)}
            >
              Open a station
            </button>
            {!canCreateStation(activeUser?.address) && (
              <span className="absolute top-[100%] text-white bg-wet-concrete rounded p-2 text-xs hidden group group-hover:block w-[120%] right-0">
                Early Access users only.{" "}
                <a
                  href="https://6vdcjqzyfj3.typeform.com/to/Ik09gzw6"
                  target="_blank"
                  className="text-electric-violet"
                  rel="noreferrer"
                >
                  Join waitlist.
                </a>
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between pl-8">
          <div className="self-end flex flex-row space-x-4">
            <span
              className={`${tab === "STATION" && "border-b mb-[-1px] font-bold"} cursor-pointer`}
              onClick={() => setTab("STATION")}
            >
              Stations
            </span>
            <span
              className={`${tab === "RFP" && "border-b mb-[-1px] font-bold"} cursor-pointer`}
              onClick={() => setTab("RFP")}
            >
              Requests for proposals
            </span>
          </div>

          <Pagination
            results={tab === "STATION" ? (terminals as any[]) : (rfps as any[])}
            resultsCount={
              tab === "STATION" ? (terminals?.length as number) : (rfps?.length as number)
            }
            page={page}
            setPage={setPage}
            resultsLabel={tab === "STATION" ? "stations" : "RFPs"}
            className="pl-6 sm:pr-6 text-sm pt-5 mb-5"
          />
        </div>
        {tab === "STATION" ? (
          <div className="border-y border-concrete pt-8 text-concrete uppercase text-xs font-bold w-full flex flex-row items-end">
            <span className="basis-96 ml-6 mb-2 tracking-wider">Station info</span>
            <span className="basis-[42rem] ml-9 mb-2 tracking-wider">Station description</span>
            <span className="basis-32 ml-6 mb-2 tracking-wider">Members</span>
            <span className="basis-32 ml-2 mb-2 tracking-wider">Open RFPs</span>
            <span className="basis-32 ml-2 mr-6 mb-2 tracking-wider">Proposals</span>
          </div>
        ) : (
          <div className="border-y border-concrete pt-8 text-concrete uppercase text-xs font-bold w-full flex flex-row items-end">
            <span className="basis-[44rem] ml-6 mb-2 tracking-wider">Request for proposals</span>
            <span className="basis-44 ml-9 mb-2 tracking-wider">Submissions</span>
            <span className="basis-44 ml-6 mb-2 tracking-wider">Open date</span>
            <span className="basis-44 ml-2 mb-2 tracking-wider">Close date</span>
            <span className="basis-44 ml-2 mb-2 tracking-wider">Creator</span>
            <span className="basis-44 ml-2 mb-2 tracking-wider">Station</span>
          </div>
        )}
        <div className="overflow-y-scroll h-[calc(100vh-141px)]">
          {tab === "STATION"
            ? terminals?.map((terminal) => {
                return <TerminalComponent terminal={terminal} key={terminal?.id} />
              })
            : rfps?.map((rfp) => {
                return <RfpComponent terminal={rfp?.terminal} key={rfp?.id} rfp={rfp} />
              })}
        </div>
      </div>
    </Layout>
  )
}

const RfpComponent = ({ rfp, terminal }) => {
  return (
    <Link href={Routes.RFPInfoTab({ terminalHandle: terminal?.handle, rfpId: rfp.id })}>
      <div
        className="w-full flex flex-row border-b border-concrete cursor-pointer hover:bg-wet-concrete py-3"
        tabIndex={0}
      >
        <div className="flex flex-col basis-[44rem] ml-6">
          <div className="flex flex-row items-center space-x-2 mb-2">
            <span className={`h-2 w-2 rounded-full ${RFP_STATUS_DISPLAY_MAP[rfp.status]?.color}`} />
            <span className="text-xs uppercase tracking-wider font-bold">
              {RFP_STATUS_DISPLAY_MAP[rfp.status]?.copy}
            </span>
          </div>
          <span className="font-bold text-lg">{rfp.data.content.title}</span>
        </div>
        <div className="flex space-x-2 basis-44 ml-9 self-center">
          <span>{rfp.submissionCount}</span>
        </div>
        <div className="basis-44 ml-6 self-center">
          <p className="uppercase">
            {rfp.startDate
              ? DateTime.fromJSDate(rfp.startDate as Date).toFormat("dd-MMM-yyyy")
              : "N/A"}
          </p>
          <p className="text-concrete text-sm self-center uppercase">
            {DateTime.fromJSDate(rfp.startDate as Date).toLocaleString(DateTime.TIME_SIMPLE)}
          </p>
        </div>
        <div className="basis-44 ml-2 self-center">
          <p className="uppercase">
            {rfp.startDate
              ? DateTime.fromJSDate(rfp.startDate as Date).toFormat("dd-MMM-yyyy")
              : "N/A"}
          </p>
          <p className="text-concrete text-sm uppercase">
            {DateTime.fromJSDate(rfp.startDate as Date).toLocaleString(DateTime.TIME_SIMPLE)}
          </p>
        </div>
        <div className="basis-44 ml-2 self-center">
          <img
            src={rfp.author.data.pfpURL || DEFAULT_PFP_URLS.USER}
            className="min-w-[46px] max-w-[46px] h-[46px] rounded-full cursor-pointer border border-wet-concrete"
            alt="pfp"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_PFP_URLS.USER
            }}
          />
        </div>
        <div className="basis-44 ml-2">
          <img
            src={rfp.terminal.data.pfpURL || DEFAULT_PFP_URLS.TERMINAL}
            className="min-w-[46px] max-w-[46px] h-[46px] rounded cursor-pointer border border-wet-concrete hover:border-marble-white"
            alt="pfp"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_PFP_URLS.TERMINAL
            }}
          />
        </div>
      </div>
    </Link>
  )
}

const TerminalComponent = ({ terminal }) => {
  const [memberCount] = useQuery(
    getTerminalMemberCount,
    {
      terminalId: terminal.id,
    },
    { suspense: false, refetchOnReconnect: false, refetchOnWindowFocus: false }
  )
  const [rfpCount] = useQuery(
    getRfpCountByTerminalId,
    {
      terminalId: terminal?.id as number,
      includeDeletedRfps: false,
      statuses: [],
    },
    { suspense: false, refetchOnReconnect: false, refetchOnWindowFocus: false }
  )

  const [proposalCount] = useQuery(
    getProposalCountByTerminal,
    { terminalId: terminal.id },
    { suspense: false, refetchOnReconnect: false, refetchOnWindowFocus: false }
  )

  return (
    <Link href={Routes.BulletinPage({ terminalHandle: terminal?.handle })}>
      <div
        className="w-full flex flex-row border-b border-concrete cursor-pointer hover:bg-wet-concrete py-3"
        tabIndex={0}
      >
        <div className="flex space-x-2 basis-96 ml-6">
          <div className="flex flex-col content-center align-middle mr-1">
            {terminal?.data?.pfpURL ? (
              <img
                src={terminal?.data?.pfpURL}
                alt="Terminal PFP"
                className="min-w-[46px] max-w-[46px] h-[46px] rounded-md cursor-pointer border border-wet-concrete"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_PFP_URLS.TERMINAL
                }}
              />
            ) : (
              <span className="w-[46px] h-[46px] rounded-md cursor-pointer border border-wet-concrete bg-gradient-to-b from-neon-blue to-torch-red" />
            )}
          </div>
          <div className="flex flex-col content-center">
            <div className="flex flex-row items-center space-x-1">
              <p className="text-lg text-marble-white font-bold">{terminal?.data?.name}</p>
            </div>
            <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
              <p className="w-max truncate leading-4">@{terminal.handle}</p>
            </div>
          </div>
        </div>
        <div className="basis-[42rem] ml-9 truncate self-center">{terminal?.data?.description}</div>
        <div className="basis-32 ml-6 self-center">{memberCount || "-"}</div>
        <div className="basis-32 ml-2 self-center">{rfpCount || "-"}</div>
        <div className="basis-32 ml-2 self-center">{proposalCount || "-"}</div>
      </div>
    </Link>
  )
}

ExploreStations.suppressFirstRenderFlicker = true
export default ExploreStations
