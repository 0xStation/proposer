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
  PAGINATION_TAKE,
  PROPOSAL_NEW_STATUS_FILTER_OPTIONS,
  PROPOSAL_ROLE_FILTER_OPTIONS,
  PROPOSAL_NEW_STATUS_DISPLAY_MAP,
} from "app/core/utils/constants"
import { ProposalStatus } from "app/proposal/types"
import { ProposalRoleType } from "@prisma/client"
import { LightBulbIcon, CogIcon } from "@heroicons/react/solid"
import AccountMediaObject from "app/core/components/AccountMediaObject"
import WorkspaceSettingsOverviewForm from "app/account/components/WorkspaceSettingsOverviewForm"
import useStore from "app/core/hooks/useStore"
import ProposalStatusPill from "app/core/components/ProposalStatusPill"

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
  const [proposalResponse] = useQuery(
    getProposalNewsByAddress,
    {
      address: toChecksumAddress(accountAddress),
      statuses: Array.from(proposalStatusFilters),
      roles: Array.from(proposalRoleFilters),
      page: page,
      paginationTake: PAGINATION_TAKE,
    },
    { enabled: !!accountAddress, suspense: false, refetchOnWindowFocus: false }
  )
  const { count, proposals } = proposalResponse || {}

  const [account] = useQuery(
    getAccountByAddress,
    { address: toChecksumAddress(accountAddress) },
    { enabled: !!accountAddress, suspense: false, refetchOnWindowFocus: false }
  )

  const ProposalTab = () => {
    return (
      <div className="p-10 flex-1 max-h-screen overflow-y-auto">
        <h1 className="text-2xl font-bold">Proposals</h1>
        <div className="mt-12 mb-4 border-b border-concrete pb-4 flex flex-row justify-between">
          <div className="space-x-2 flex flex-row">
            <FilterPill
              label="status"
              filterOptions={PROPOSAL_NEW_STATUS_FILTER_OPTIONS.map((pnStatus) => ({
                name: PROPOSAL_NEW_STATUS_DISPLAY_MAP[pnStatus]?.copy?.toUpperCase(),
                value: pnStatus,
              }))}
              appliedFilters={proposalStatusFilters}
              setAppliedFilters={setProposalStatusFilters}
              refetchCallback={() => {
                setPage(0)
                invalidateQuery(getProposalNewsByAddress)
              }}
            />
            <FilterPill
              label="My role"
              filterOptions={PROPOSAL_ROLE_FILTER_OPTIONS.map((proposalRole) => ({
                name: proposalRole.toUpperCase(),
                value: proposalRole,
              }))}
              appliedFilters={proposalRoleFilters}
              setAppliedFilters={setProposalRoleFilters}
              refetchCallback={() => {
                setPage(0)
                invalidateQuery(getProposalNewsByAddress)
              }}
            />
          </div>
          <Pagination
            results={proposals as any[]}
            resultsCount={count || 0}
            page={page}
            setPage={setPage}
            resultsLabel="proposals"
            className="ml-6 sm:ml-0 text-sm self-end"
          />
        </div>
        {/* PROPOSALS TABLE */}
        <table className="w-full">
          {/* TABLE HEADERS */}
          <thead>
            <tr className="border-b border-concrete">
              <th className="pl-4 text-xs uppercase text-light-concrete pb-2 text-left">Title</th>
              <th className="text-xs uppercase text-light-concrete pb-2 text-left">Status</th>
              <th className="text-xs uppercase text-light-concrete pb-2 text-left">Payment</th>
              <th className="text-xs uppercase text-light-concrete pb-2 text-left">Submitted at</th>
            </tr>
          </thead>
          {/* TABLE BODY */}
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
                      <td className="pl-4 text-base py-4 font-bold w-128">
                        {proposal.data.content.title}
                      </td>
                      <td className="py-4">
                        <ProposalStatusPill status={proposal?.status} />
                      </td>
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
          <div className="w-full h-3/4 flex items-center flex-col sm:justify-center sm:mt-0">
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
        {/* LEFT SIDEBAR */}
        <div className="h-full w-[288px] border-r border-concrete p-6">
          <div className="pb-6 border-b border-concrete space-y-6">
            {/* PROFILE */}
            {account ? (
              <AccountMediaObject account={account} />
            ) : (
              // LOADING STATE
              <div
                tabIndex={0}
                className={`h-10 w-full rounded-4xl flex flex-row bg-wet-concrete shadow border-solid motion-safe:animate-pulse`}
              />
            )}
            {/* CTA */}
            <Link href={Routes.CreateProposalNew()}>
              <Button className="w-full">Propose</Button>
            </Link>
          </div>
          {/* TABS */}
          <ul className="mt-6 space-y-2">
            {/* PROPOSALS */}
            <li
              className={`p-2 rounded flex flex-row items-center space-x-2 cursor-pointer ${
                activeTab === Tab.PROPOSALS && "bg-wet-concrete"
              }`}
              onClick={() => setActiveTab(Tab.PROPOSALS)}
            >
              <LightBulbIcon className="h-5 w-5 text-white cursor-pointer" />
              <span>Proposals</span>
            </li>
            {/* SETTINGS */}
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
        {/* TAB CONTENT */}
        {activeTab === Tab.PROPOSALS ? <ProposalTab /> : <SettingsTab />}
      </div>
    </Layout>
  )
}

WorkspaceHome.suppressFirstRenderFlicker = true
export default WorkspaceHome
