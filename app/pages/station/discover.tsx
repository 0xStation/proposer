import { useState } from "react"
import { BlitzPage, Link, Routes, useQuery } from "blitz"

import Layout from "app/core/layouts/Layout"
import Pagination from "app/core/components/Pagination"
import { DEFAULT_PFP_URLS, PAGINATION_TAKE } from "app/core/utils/constants"
import getAllTerminals from "app/terminal/queries/getAllTerminals"
import getTerminalMemberCount from "app/accountTerminal/queries/getTerminalMemberCount"
import getRfpCountByTerminalId from "app/rfp/queries/getRfpCountByTerminalId"
import getProposalCountByTerminal from "app/proposal/queries/getProposalCountByTerminal"

const DiscoverStations: BlitzPage = () => {
  const [page, setPage] = useState<number>(0)

  const [terminals] = useQuery(
    getAllTerminals,
    { page: page, paginationTake: PAGINATION_TAKE },
    { suspense: false }
  )

  return (
    <Layout title="Discover Stations">
      <div className="h-screen">
        <div className="pt-8 pl-8 pb-12 flex flex-row justify-between">
          <div>
            <h1 className="font-bold text-2xl">Discover</h1>
            <p>All stations, find your tribe</p>
          </div>
          <button className="text-tunnel-black bg-electric-violet rounded hover:opacity-70 h-[35px] px-6 mr-8">
            Open a station
          </button>
        </div>
        <div className="border-t border-concrete">
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
          <div className="border-b border-concrete mt-5 text-concrete uppercase text-xs font-bold w-full flex flex-row items-end">
            <span className="basis-96 ml-6 mb-2 tracking-wider">Station info</span>
            <span className="basis-[42rem] ml-9 mb-2 tracking-wider">Station description</span>
            <span className="basis-32 ml-6 mb-2 tracking-wider">Members</span>
            <span className="basis-32 ml-2 mb-2 tracking-wider">Open RFPs</span>
            <span className="basis-32 ml-2 mr-6 mb-2 tracking-wider">Proposals</span>
          </div>
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
    { suspense: false }
  )
  const [rfpCount] = useQuery(
    getRfpCountByTerminalId,
    {
      terminalId: terminal?.id as number,
      includeDeletedRfps: false,
      statuses: [],
    },
    { suspense: false }
  )

  const [proposalCount] = useQuery(
    getProposalCountByTerminal,
    { terminalId: terminal.id },
    { suspense: false }
  )

  return (
    <Link href={Routes.BulletinPage({ terminalHandle: terminal?.handle })}>
      <div className="w-full flex flex-row border-b border-concrete cursor-pointer hover:bg-wet-concrete pl-6 py-3 pr-4">
        <div className="flex space-x-2 basis-96">
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
        <div className="basis-[38rem] mr-9 truncate self-center">{terminal?.data?.description}</div>
        <div className="basis-32 self-center">{memberCount || "-"}</div>
        <div className="basis-32 self-center">{rfpCount || "-"}</div>
        <div className="basis-28 self-center">{proposalCount || "-"}</div>
      </div>
    </Link>
  )
}

DiscoverStations.suppressFirstRenderFlicker = true
export default DiscoverStations
