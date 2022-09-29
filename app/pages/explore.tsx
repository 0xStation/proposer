import { useState } from "react"
import { BlitzPage, Link, Routes, useQuery } from "blitz"
import Layout from "app/core/layouts/Layout"
import Pagination from "app/core/components/Pagination"
import { PAGINATION_TAKE, Sizes } from "app/core/utils/constants"
import getAllAccounts from "app/account/queries/getAllAccounts"
import getAllProposals from "app/proposal/queries/getAllProposals"
import AccountMediaObject from "app/core/components/AccountMediaObject"
import ProgressCircleAndNumber from "app/core/components/ProgressCircleAndNumber"
import { ProposalStatus, ProposalRoleApprovalStatus } from "@prisma/client"
import { formatCurrencyAmount } from "app/core/utils/formatCurrencyAmount"
import { formatDate } from "app/core/utils/formatDate"
import { CollaboratorPfps } from "app/core/components/CollaboratorPfps"
import ProposalStatusPill from "app/core/components/ProposalStatusPill"
import { ProposalRole } from "app/proposalRole/types"

enum Tab {
  WORKSPACES = "WORKSPACES",
  PROPOSALS = "PROPOSALS",
}

const Explore: BlitzPage = () => {
  const [workspacePage, setWorkspacePage] = useState<number>(0)
  const [proposalPage, setProposalPage] = useState<number>(0)
  const [tab, setTab] = useState<Tab>(Tab.WORKSPACES)

  const [accounts] = useQuery(
    getAllAccounts,
    { page: workspacePage, paginationTake: PAGINATION_TAKE, sortUpdatedAt: true },
    { suspense: false, refetchOnReconnect: false, refetchOnWindowFocus: false }
  )

  const [proposals] = useQuery(
    getAllProposals,
    { page: proposalPage, paginationTake: PAGINATION_TAKE },
    { suspense: false, refetchOnReconnect: false, refetchOnWindowFocus: false }
  )

  return (
    <Layout title="Explore">
      <div className="h-[calc(100vh-240px)] p-10 flex-1">
        <h1 className="font-bold text-2xl">Explore</h1>
        <div className="flex flex-row mb-4 border-b border-concrete sm:flex-row justify-between">
          {/* Tabs */}
          <div className="self-end flex flex-row space-x-4">
            <span
              className={`${
                tab === Tab.WORKSPACES && "border-b mb-[-1px] font-bold"
              } cursor-pointer`}
              onClick={() => setTab(Tab.WORKSPACES)}
            >
              Directory
            </span>
            <span
              className={`${
                tab === Tab.PROPOSALS && "border-b mb-[-1px] font-bold"
              } cursor-pointer`}
              onClick={() => setTab(Tab.PROPOSALS)}
            >
              Proposals
            </span>
          </div>

          {tab === Tab.WORKSPACES && (
            <Pagination
              results={accounts as any[]}
              resultsCount={accounts?.length as number}
              page={workspacePage}
              setPage={setWorkspacePage}
              resultsLabel={Tab.WORKSPACES.toString().toLowerCase()}
              className="pl-6 sm:pr-6 text-sm pt-5 mb-5"
            />
          )}

          {tab === Tab.PROPOSALS && (
            <Pagination
              results={proposals as any[]}
              resultsCount={proposals?.length as number}
              page={proposalPage}
              setPage={setProposalPage}
              resultsLabel={Tab.PROPOSALS.toString().toLowerCase()}
              className="pl-6 sm:pr-6 text-sm pt-5 mb-5"
            />
          )}
        </div>
        {/* Table */}
        <table className="w-full table-auto">
          {/* Columns */}
          <thead>
            <tr className="border-b border-concrete">
              {tab === Tab.WORKSPACES && (
                <>
                  <th className="text-xs uppercase text-light-concrete pb-2 pl-4 text-left">
                    Info
                  </th>
                  <th className="text-xs uppercase text-light-concrete pb-2 text-left">About</th>
                </>
              )}
              {tab === Tab.PROPOSALS && (
                <>
                  <th className="pl-4 w-96 text-xs tracking-wide uppercase text-concrete pb-2 text-left">
                    Title
                  </th>
                  <th className="w-96 text-xs tracking-wide uppercase text-concrete pb-2 text-left">
                    Proposal status
                  </th>
                  <th className="w-96 text-xs tracking-wide uppercase text-concrete pb-2 text-left">
                    Payment
                  </th>
                  <th className="text-xs tracking-wide uppercase text-concrete pb-2 text-left">
                    Last updated
                  </th>
                  {/* title-less header for role pfps */}
                  <th />
                </>
              )}
            </tr>
          </thead>
          {/* Rows */}
          <tbody>
            {accounts &&
              tab === Tab.WORKSPACES &&
              accounts.map((account, idx) => {
                return (
                  <Link
                    href={Routes.WorkspaceHome({ accountAddress: account.address as string })}
                    key={`table-row-${idx}`}
                  >
                    <tr className="border-b border-wet-concrete cursor-pointer hover:bg-wet-concrete">
                      <td className="pl-4 py-4 w-64">
                        <AccountMediaObject account={account} />
                      </td>
                      <td className="text-normal py-4">{account?.data?.bio}</td>
                    </tr>
                  </Link>
                )
              })}
            {proposals &&
              proposals.length > 0 &&
              tab === Tab.PROPOSALS &&
              proposals.map((proposal, idx) => {
                const uniqueRoleAccounts = (proposal?.roles as ProposalRole[])
                  ?.map((role) => role?.account!)
                  ?.filter((account, idx, accounts) => {
                    return accounts?.findIndex((acc) => acc?.address === account?.address) === idx
                  })
                return (
                  <Link
                    href={Routes.ViewProposal({ proposalId: proposal.id })}
                    key={`table-row-${idx}`}
                  >
                    <tr className="border-b border-concrete cursor-pointer hover:bg-wet-concrete">
                      {/* TITLE */}
                      <td className="pl-4 text-base py-4 font-bold">
                        {proposal.data.content.title.length > 44
                          ? proposal.data.content.title.substr(0, 44) + "..."
                          : proposal.data.content.title}
                      </td>
                      {/* PROPOSAL STATUS */}
                      <td className="py-4">
                        <div className="flex flex-row space-x-2">
                          <ProposalStatusPill status={proposal?.status} />
                        </div>
                      </td>
                      {/* PAYMENT */}
                      <td className="text-base py-4">
                        {proposal.data.totalPayments.length > 0
                          ? `${formatCurrencyAmount(
                              proposal.data.totalPayments[0]?.amount.toString()
                            )} ${proposal.data.totalPayments[0]?.token.symbol}`
                          : "None"}
                      </td>
                      {/* LAST UPDATED */}
                      <td className="text-base py-4">{formatDate(proposal.timestamp)}</td>
                      {/* COLLABORATORS */}
                      <td className="pr-12">
                        <div className="flex">
                          {uniqueRoleAccounts?.length > 0 ? (
                            <CollaboratorPfps accounts={uniqueRoleAccounts} size={Sizes.BASE} />
                          ) : (
                            ""
                          )}
                        </div>
                      </td>
                    </tr>
                  </Link>
                )
              })}
          </tbody>
        </table>
        {!accounts &&
          Array.from(Array(10)).map((idx) => (
            <div
              key={idx}
              tabIndex={0}
              className="h-[72px] w-full flex flex-row my-1 rounded-lg bg-wet-concrete shadow border-solid motion-safe:animate-pulse"
            />
          ))}
      </div>
    </Layout>
  )
}

Explore.suppressFirstRenderFlicker = true
export default Explore
