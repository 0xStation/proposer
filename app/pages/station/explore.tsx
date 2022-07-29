import { useState } from "react"
import { BlitzPage, Link, Routes, useQuery, useRouter } from "blitz"

import Layout from "app/core/layouts/Layout"
import Pagination from "app/core/components/Pagination"
import { DEFAULT_PFP_URLS, PAGINATION_TAKE } from "app/core/utils/constants"
import getAllTerminals from "app/terminal/queries/getAllTerminals"
import getTerminalMemberCount from "app/accountTerminal/queries/getTerminalMemberCount"
import getRfpCountByTerminalId from "app/rfp/queries/getRfpCountByTerminalId"
import getProposalCountByTerminal from "app/proposal/queries/getProposalCountByTerminal"
import useStore from "app/core/hooks/useStore"
import { canCreateStation } from "app/core/utils/permissions"

const ExploreStations: BlitzPage = () => {
  const activeUser = useStore((state) => state.activeUser)
  const [page, setPage] = useState<number>(0)
  const router = useRouter()

  const [terminals] = useQuery(
    getAllTerminals,
    { page: page, paginationTake: PAGINATION_TAKE },
    { suspense: false, refetchOnReconnect: false, refetchOnWindowFocus: false }
  )

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
              onClick={() => router.push(Routes.CreateTerminalDetailsPage())}
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
        <div className="flex flex-col sm:flex-row justify-end items-center">
          <Pagination
            results={terminals as any[]}
            resultsCount={terminals?.length as number}
            page={page}
            setPage={setPage}
            resultsLabel="stations"
            className="pl-6 sm:pr-6 text-sm pt-5"
          />
        </div>
        <div className="border-y border-concrete mt-5 pt-2 text-concrete uppercase text-xs font-bold w-full flex flex-row items-end">
          <span className="basis-96 ml-6 mb-2 tracking-wider">Station info</span>
          <span className="basis-[42rem] ml-9 mb-2 tracking-wider">Station description</span>
          <span className="basis-32 ml-6 mb-2 tracking-wider">Members</span>
          <span className="basis-32 ml-2 mb-2 tracking-wider">Open RFPs</span>
          <span className="basis-32 ml-2 mr-6 mb-2 tracking-wider">Proposals</span>
        </div>
        <div className="overflow-y-scroll h-[calc(100vh-141px)]">
          {terminals?.map((terminal) => {
            return <TerminalComponent terminal={terminal} key={terminal?.id} />
          })}
        </div>
      </div>
    </Layout>
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
