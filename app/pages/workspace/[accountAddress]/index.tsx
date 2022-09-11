import { useState, useEffect } from "react"
import { BlitzPage, useParam, useQuery } from "blitz"
import Layout from "app/core/layouts/Layout"
import Button from "app/core/components/sds/buttons/Button"
import getAccountProposalsByAddress from "app/account/queries/getAccountProposalsByAddress"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { formatDate } from "app/core/utils/formatDate"
import FilterPill from "app/core/components/FilterPill"
import Pagination from "app/core/components/Pagination"
import {
  PROPOSAL_STATUS_DISPLAY_MAP,
  PAGINATION_TAKE,
  PROPOSAL_STATUSES_FILTER_OPTIONS,
} from "app/core/utils/constants"
import { RfpStatus } from "app/rfp/types"

const WorkspaceHome: BlitzPage = () => {
  const [proposalStatusFilters, setProposalStatusFilters] = useState<Set<RfpStatus>>(
    new Set<RfpStatus>()
  )
  const accountAddress = useParam("accountAddress", "string") as string
  const [accountProposals] = useQuery(
    getAccountProposalsByAddress,
    { address: toChecksumAddress(accountAddress) },
    { enabled: !!accountAddress, suspense: false, refetchOnWindowFocus: false }
  )

  console.log(accountProposals)

  return (
    <Layout>
      <div className="flex flex-row h-full">
        <div className="h-full w-[288px] border-r border-concrete p-6">
          <div className="pb-6 border-b border-concrete space-y-6">
            <p>pfp</p>
            <Button className="w-full">Propose</Button>
          </div>
          <ul className="mt-6">
            <li className="font-bold bg-wet-concrete p-1 pl-4 rounded">Proposals</li>
            <li className="font-bold p-1 pl-4 rounded">Settings</li>
          </ul>
        </div>
        <div className="p-10 flex-1">
          <h1 className="text-2xl">Propose</h1>
          <div className="mt-12 mb-4 border-b border-concrete pb-4">
            <FilterPill
              label="status"
              filterOptions={PROPOSAL_STATUSES_FILTER_OPTIONS.map((rfpStatus) => ({
                name: PROPOSAL_STATUS_DISPLAY_MAP[rfpStatus]?.copy?.toUpperCase(),
                value: rfpStatus,
              }))}
              appliedFilters={proposalStatusFilters}
              setAppliedFilters={setProposalStatusFilters}
              refetchCallback={() => {
                // setPage(0)
                // invalidateQuery(getRfpsByTerminalId)
              }}
            />
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-concrete">
                <th className="text-xs uppercase text-light-concrete pb-2 text-left">Title</th>
                <th className="text-xs uppercase text-light-concrete pb-2 text-left">Status</th>
                <th className="text-xs uppercase text-light-concrete pb-2 text-left">Payment</th>
                <th className="text-xs uppercase text-light-concrete pb-2 text-left">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {accountProposals &&
                accountProposals.map((ap) => {
                  return (
                    <tr className="border-b border-concrete">
                      <td className="text-xl py-4 font-bold">
                        {ap?.proposal?.data?.content?.title}
                      </td>
                      <td className="py-4">
                        <span className="bg-neon-carrot text-tunnel-black px-2 py-1 rounded-full text-sm uppercase">
                          {ap?.proposal?.status}
                        </span>
                      </td>
                      <td className="text-xl py-4">
                        {ap?.proposal?.data?.funding.amount} {ap?.proposal?.data?.funding.symbol}
                      </td>
                      <td className="text-xl py-4">{formatDate(ap.proposal.createdAt)}</td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}

WorkspaceHome.suppressFirstRenderFlicker = true
export default WorkspaceHome
