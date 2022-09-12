import { useState } from "react"
import { BlitzPage, useParam, useQuery, invalidateQuery, Routes, Link } from "blitz"
import Layout from "app/core/layouts/Layout"
import Button from "app/core/components/sds/buttons/Button"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { formatDate } from "app/core/utils/formatDate"
import FilterPill from "app/core/components/FilterPill"
import GetProposalsByAddress from "app/proposal/queries/getProposalsByAddress"
import getProposalNewsByAddress from "app/proposalNew/queries/getProposalNewsByAddress"
import Pagination from "app/core/components/Pagination"
import {
  PROPOSAL_STATUS_DISPLAY_MAP,
  PAGINATION_TAKE,
  PROPOSAL_STATUSES_FILTER_OPTIONS,
  PROPOSAL_ROLE_FILTER_OPTIONS,
} from "app/core/utils/constants"
import { ProposalStatus } from "app/proposal/types"
import { ProposalRoleType } from "@prisma/client"
import { LightBulbIcon, CogIcon } from "@heroicons/react/solid"
import { ProposalNew } from "app/proposalNew/types"

enum Tab {
  PROPOSALS = "PROPOSALS",
  SETTINGS = "SETTINGS",
}

// loose helpers for formatting -- we could clean this up into its own module
// or even do some processing at the data fetching layer
// but including it here for now to prioritize shipping
const getPaymentTotal = (proposal: ProposalNew) => {
  const payments = proposal.data.payments

  if (!payments) {
    return 0
  }

  const total = payments.reduce((acc, payment) => {
    if (payment.amount) {
      return acc + parseFloat(payment.amount)
    }
    return acc
  }, 0)

  return total
}

// payment could be null, we need to handle that case as well
const getPaymentTotalFormatted = (proposal: ProposalNew) => {
  const payments = proposal.data.payments
  console.log(payments)

  if (!payments || payments.length === 0) {
    return "No payments"
  }

  const amount = getPaymentTotal(proposal)
  return `${amount} ${payments[0]?.token.symbol}`
}

const WorkspaceHome: BlitzPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.PROPOSALS)
  const [proposalStatusFilters, setProposalStatusFilters] = useState<Set<ProposalStatus>>(
    new Set<ProposalStatus>()
  )
  const [proposalRoleFilters, setProposalRoleFilters] = useState<Set<ProposalRoleType>>(
    new Set<ProposalRoleType>()
  )
  const [page, setPage] = useState<number>(0)
  const accountAddress = useParam("accountAddress", "string") as string
  const [proposals] = useQuery(
    getProposalNewsByAddress,
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
            {/* AccountMediaObject? */}
            <p>pfp</p>
            <Link href={Routes.CreateProposalNew()}>
              <Button className="w-full">Propose</Button>
            </Link>
          </div>
          <ul className="mt-6 space-y-2">
            <li
              className={`p-2 rounded flex flex-row items-center space-x-2 cursor-pointer ${
                activeTab === Tab.PROPOSALS && "bg-wet-concrete font-bold"
              }`}
              onClick={() => setActiveTab(Tab.PROPOSALS)}
            >
              <LightBulbIcon className="h-5 w-5 text-white cursor-pointer" />
              <span>Proposals</span>
            </li>
            {/* <li
              className={`p-2 rounded flex flex-row items-center space-x-2 cursor-pointer ${
                activeTab === Tab.SETTINGS && "bg-wet-concrete font-bold"
              }`}
              onClick={() => setActiveTab(Tab.SETTINGS)}
            >
              <CogIcon className="h-5 w-5 text-white cursor-pointer" />
              <span>Settings</span>
            </li> */}
          </ul>
        </div>
        <div className="p-10 flex-1">
          <h1 className="text-2xl">Propose</h1>
          <div className="mt-12 mb-4 border-b border-concrete pb-4 flex flex-row justify-between">
            {/* empty div to push the pagination to the right before filters come back in */}
            <div></div>
            {/* <div className="space-x-2 flex flex-row">
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
            </div> */}
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
                {/* <th className="text-xs uppercase text-light-concrete pb-2 text-left">Status</th> */}
                <th className="text-xs uppercase text-light-concrete pb-2 text-left">Payment</th>
                <th className="text-xs uppercase text-light-concrete pb-2 text-left">
                  Submitted at
                </th>
              </tr>
            </thead>
            <tbody>
              {proposals &&
                proposals.map((proposal, idx) => {
                  return (
                    <tr className="border-b border-concrete" key={`table-row-${idx}`}>
                      <td className="text-xl py-4 font-bold">{proposal.data.content.title}</td>
                      {/* <td className="py-4">
                        <span className="bg-neon-carrot text-tunnel-black px-2 py-1 rounded-full text-sm uppercase">
                          {proposal.status}
                        </span>
                      </td> */}
                      <td className="text-xl py-4">{getPaymentTotalFormatted(proposal)}</td>
                      <td className="text-xl py-4">{formatDate(proposal.timestamp)}</td>
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
