import { useState, useEffect } from "react"
import { BlitzPage, useParam, useQuery, invalidateQuery } from "blitz"
import Layout from "app/core/layouts/Layout"
import Button from "app/core/components/sds/buttons/Button"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { formatDate } from "app/core/utils/formatDate"
import FilterPill from "app/core/components/FilterPill"
import GetProposalsByAddress from "app/proposal/queries/getProposalsByAddress"
import Pagination from "app/core/components/Pagination"
import {
  PROPOSAL_STATUS_DISPLAY_MAP,
  PAGINATION_TAKE,
  PROPOSAL_STATUSES_FILTER_OPTIONS,
  PROPOSAL_ROLE_FILTER_OPTIONS,
} from "app/core/utils/constants"
import { ProposalStatus } from "app/proposal/types"
import { ProposalRoleType } from "@prisma/client"

const WorkspaceHome: BlitzPage = () => {
  const [proposalStatusFilters, setProposalStatusFilters] = useState<Set<ProposalStatus>>(
    new Set<ProposalStatus>()
  )
  const [proposalRoleFilters, setProposalRoleFilters] = useState<Set<ProposalRoleType>>(
    new Set<ProposalRoleType>()
  )
  const [page, setPage] = useState<number>(0)
  const accountAddress = useParam("accountAddress", "string") as string
  const [proposals] = useQuery(
    GetProposalsByAddress,
    {
      address: toChecksumAddress(accountAddress),
      statuses: Array.from(proposalStatusFilters),
      roles: Array.from(proposalRoleFilters),
    },
    { enabled: !!accountAddress, suspense: false, refetchOnWindowFocus: false }
  )

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
          <div className="mt-12 mb-4 border-b border-concrete pb-4 flex flex-row justify-between">
            <div className="space-x-2 flex flex-row">
              <FilterPill
                label="status"
                filterOptions={PROPOSAL_STATUSES_FILTER_OPTIONS.map((rfpStatus) => ({
                  name: PROPOSAL_STATUS_DISPLAY_MAP[rfpStatus]?.copy?.toUpperCase(),
                  value: rfpStatus,
                }))}
                appliedFilters={proposalStatusFilters}
                setAppliedFilters={setProposalStatusFilters}
                refetchCallback={() => {
                  setPage(0)
                  invalidateQuery(GetProposalsByAddress)
                }}
              />
              <FilterPill
                label="My role"
                filterOptions={PROPOSAL_ROLE_FILTER_OPTIONS.map((rfpStatus) => ({
                  name: rfpStatus.toUpperCase(),
                  value: rfpStatus,
                }))}
                appliedFilters={proposalRoleFilters}
                setAppliedFilters={setProposalRoleFilters}
                refetchCallback={() => {
                  setPage(0)
                  invalidateQuery(GetProposalsByAddress)
                }}
              />
            </div>
            <Pagination
              results={proposals as any[]}
              resultsCount={(proposals ? proposals.length : 0) as number}
              page={page}
              setPage={setPage}
              resultsLabel="proposals"
              className="ml-6 sm:ml-0 text-sm self-end"
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
              {proposals &&
                proposals.map((proposal, idx) => {
                  return (
                    <tr className="border-b border-concrete" key={`table-row-${idx}`}>
                      <td className="text-xl py-4 font-bold">{proposal.data.content.title}</td>
                      <td className="py-4">
                        <span className="bg-neon-carrot text-tunnel-black px-2 py-1 rounded-full text-sm uppercase">
                          {proposal.status}
                        </span>
                      </td>
                      <td className="text-xl py-4">
                        {proposal.data.funding.amount} {proposal.data.funding.symbol}
                      </td>
                      <td className="text-xl py-4">{formatDate(proposal.createdAt)}</td>
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
