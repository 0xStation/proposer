import { useState } from "react"
import { BlitzPage, useParam, useQuery, invalidateQuery, Routes, Link, useSession } from "blitz"
import Layout from "app/core/layouts/Layout"
import Button from "app/core/components/sds/buttons/Button"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { formatDate } from "app/core/utils/formatDate"
import FilterPill from "app/core/components/FilterPill"
import getProposalNewsByAddress from "app/proposalNew/queries/getProposalNewsByAddress"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
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
import AccountMediaObject from "app/core/components/AccountMediaObject"
import WorkspaceSettingsOverviewForm from "app/account/components/WorkspaceSettingsOverviewForm"
import useStore from "app/core/hooks/useStore"

enum Tab {
  PROPOSALS = "PROPOSALS",
  SETTINGS = "SETTINGS",
}

const WorkspaceHome: BlitzPage = () => {
  const session = useSession({ suspense: false })
  const setToastState = useStore((state) => state.setToastState)
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

  const [account] = useQuery(
    getAccountByAddress,
    { address: toChecksumAddress(accountAddress) },
    { enabled: !!accountAddress, suspense: false, refetchOnWindowFocus: false }
  )

  const ProposalTab = () => {
    return (
      <div className="h-[calc(100vh-240px)] p-10 flex-1">
        <h1 className="text-2xl font-bold">Proposals</h1>
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
              <th className="w-4">{/* spacer for left indent */}</th>
              <th className="text-xs uppercase text-light-concrete pb-2 text-left">Title</th>
              {/* <th className="text-xs uppercase text-light-concrete pb-2 text-left">Status</th> */}
              <th className="text-xs uppercase text-light-concrete pb-2 text-left">Payment</th>
              <th className="text-xs uppercase text-light-concrete pb-2 text-left">Submitted at</th>
            </tr>
          </thead>
          <tbody>
            {proposals &&
              proposals.length > 0 &&
              proposals.map((proposal, idx) => {
                return (
                  <Link
                    href={Routes.ViewProposalNew({ proposalId: proposal.id })}
                    key={`table-row-${idx}`}
                  >
                    <tr className="border-b border-concrete cursor-pointer hover:bg-wet-concrete">
                      <td>{/* spacer */}</td>
                      <td className="text-base py-4 font-bold w-128">
                        {proposal.data.content.title}
                      </td>
                      {/* <td className="py-4">
                        <span className="bg-neon-carrot text-tunnel-black px-2 py-1 rounded-full text-sm uppercase">
                          {proposal.status}
                        </span>
                      </td> */}
                      <td className="text-base py-4 w-48">
                        {proposal.data.totalPayments.length > 0
                          ? `${proposal.data.totalPayments[0]?.amount} ${proposal.data.totalPayments[0]?.token.symbol}`
                          : "None"}
                      </td>
                      <td className="text-base py-4">{formatDate(proposal.timestamp)}</td>
                    </tr>
                  </Link>
                )
              })}
          </tbody>
        </table>
        {!proposals &&
          Array.from(Array(10)).map((idx) => (
            <div
              key={idx}
              tabIndex={0}
              className={`flex flex-row w-full my-1 rounded-lg bg-wet-concrete shadow border-solid h-[48px] motion-safe:animate-pulse`}
            />
          ))}
        {proposals && proposals.length === 0 && (
          <div className="w-full h-full flex items-center flex-col sm:justify-center sm:mt-0">
            <p className="text-2xl font-bold w-[295px] text-center">
              This workspace has no proposals yet
            </p>
          </div>
        )}
      </div>
    )
  }

  const SettingsTab = () => {
    return (
      <div className="h-[calc(100vh-240px)] p-10 flex-1">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="mt-12">
          <WorkspaceSettingsOverviewForm
            onSuccess={() => {
              invalidateQuery(getAccountByAddress)
              setToastState({
                isToastShowing: true,
                type: "success",
                message: "Workspace successfully updated",
              })
            }}
            account={account || undefined}
            isEdit={true}
          />
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="flex flex-row h-full">
        {/* Left Bar */}
        <div className="h-full w-[288px] border-r border-concrete p-6">
          {/* Top Metadata and CTA */}
          <div className="pb-6 border-b border-concrete space-y-6">
            {account ? (
              <AccountMediaObject account={account} />
            ) : (
              <div
                tabIndex={0}
                className={`flex flex-row w-full rounded-lg bg-wet-concrete shadow border-solid h-[40px] motion-safe:animate-pulse`}
              />
            )}
            <Link href={Routes.CreateProposalNew()}>
              <Button className="w-full">Propose</Button>
            </Link>
          </div>
          {/* Tabs */}
          <ul className="mt-6 space-y-2">
            <li
              className={`p-2 rounded flex flex-row items-center space-x-2 cursor-pointer ${
                activeTab === Tab.PROPOSALS && "bg-wet-concrete"
              }`}
              onClick={() => setActiveTab(Tab.PROPOSALS)}
            >
              <LightBulbIcon className="h-5 w-5 text-white cursor-pointer" />
              <span>Proposals</span>
            </li>
            {!!session && session.userId === account?.id && (
              <li
                className={`p-2 rounded flex flex-row items-center space-x-2 cursor-pointer ${
                  activeTab === Tab.SETTINGS && "bg-wet-concrete"
                }`}
                onClick={() => setActiveTab(Tab.SETTINGS)}
              >
                <CogIcon className="h-5 w-5 text-white cursor-pointer" />
                <span>Settings</span>
              </li>
            )}
          </ul>
        </div>
        {/* Primary Content */}
        {activeTab === Tab.PROPOSALS ? <ProposalTab /> : <SettingsTab />}
      </div>
    </Layout>
  )
}

WorkspaceHome.suppressFirstRenderFlicker = true
export default WorkspaceHome
