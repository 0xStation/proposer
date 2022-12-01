import { gSSP } from "app/blitz-server"
import Link from "next/link"
import { useQuery, invalidateQuery, invoke } from "@blitzjs/rpc"
import { BlitzPage, useParam, Routes } from "@blitzjs/next"
import { useState } from "react"
import Layout from "app/core/layouts/Layout"
import Button from "app/core/components/sds/buttons/Button"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { formatDate } from "app/core/utils/formatDate"
import FilterPill from "app/core/components/FilterPill"
import getProposalsByAddress from "app/proposal/queries/getProposalsByAddress"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import Pagination from "app/core/components/Pagination"
import {
  PAGINATION_TAKE,
  PROPOSAL_NEW_STATUS_FILTER_OPTIONS,
  PROPOSAL_ROLE_FILTER_OPTIONS,
  PROPOSAL_NEW_STATUS_DISPLAY_MAP,
  Sizes,
} from "app/core/utils/constants"
import { ProposalStatus, ProposalRoleApprovalStatus, ProposalRoleType } from "@prisma/client"
import ProposalStatusPill from "app/core/components/ProposalStatusPill"
import { useEnsName } from "wagmi"
import { CollaboratorPfps } from "app/core/components/CollaboratorPfps"
import { ProposalRole } from "app/proposalRole/types"
import { formatCurrencyAmount } from "app/core/utils/formatCurrencyAmount"
import ProgressCircleAndNumber from "app/core/components/ProgressCircleAndNumber"
import { isAddress } from "ethers/lib/utils"
import getProposalCountForAccount from "app/proposal/queries/getProposalCountForAccount"
import WorkspaceSidebar from "app/core/components/WorkspaceSidebar"
import { useRouter } from "next/router"
import { ProposalStatusIndicator } from "app/proposal/components/ProposalStatusIndicator"

export const getServerSideProps = gSSP(async ({ params = {} }) => {
  const { accountAddress } = params

  if (!accountAddress || !isAddress(accountAddress as string)) {
    return {
      notFound: true,
    }
  }

  const account = await invoke(getAccountByAddress, {
    address: toChecksumAddress(accountAddress as string),
  })

  if (!account) {
    return {
      notFound: true,
    }
  }

  return {
    props: {}, // will be passed to the page component as props
  }
})

const WorkspaceHome: BlitzPage = () => {
  const accountAddress = useParam("accountAddress", "string") as string
  const router = useRouter()

  const { data: accountEnsName } = useEnsName({
    address: accountAddress as `0x${string}`,
    chainId: 1,
    cacheTime: 10 * 60 * 1000, // 10 minutes (time in ms) which the data should remain in the cache
  })

  const [proposalStatusFilters, setProposalStatusFilters] = useState<Set<ProposalStatus>>(
    new Set<ProposalStatus>()
  )
  const [proposalRoleFilters, setProposalRoleFilters] = useState<Set<ProposalRoleType>>(
    new Set<ProposalRoleType>()
  )
  const [proposalPage, setProposalPage] = useState<number>(0)

  const [proposals] = useQuery(
    getProposalsByAddress,
    {
      address: toChecksumAddress(accountAddress),
      statuses: Array.from(proposalStatusFilters),
      roles: Array.from(proposalRoleFilters),
      page: proposalPage,
      paginationTake: PAGINATION_TAKE,
    },
    {
      enabled: !!accountAddress,
      suspense: false,
      refetchOnWindowFocus: false,
      cacheTime: 60 * 1000, // 1 minute
    }
  )

  const [proposalCount] = useQuery(
    getProposalCountForAccount,
    {
      address: toChecksumAddress(accountAddress),
      statuses: Array.from(proposalStatusFilters),
      roles: Array.from(proposalRoleFilters),
    },
    {
      enabled: !!accountAddress,
      suspense: false,
      refetchOnWindowFocus: false,
      cacheTime: 60 * 1000, // 1 minute
    }
  )

  return (
    <>
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-bold">Proposals</h1>
        <Button
          className="hidden md:block w-full px-10"
          overrideWidthClassName="max-w-fit"
          onClick={() => {
            router.push(
              Routes.ProposalNewFunding({
                // pre-fill for both so that if user changes toggle to reverse roles, the input address is still there
                clients: accountEnsName || accountAddress,
                contributors: accountEnsName || accountAddress,
              })
            )
          }}
        >
          Propose
        </Button>
      </div>
      {/* FILTERS & PAGINATION */}
      <div className="mt-8 mb-4 pb-4 flex flex-row justify-between">
        {/* FILTERS */}
        <div className="space-x-2 hidden md:flex flex-row">
          <FilterPill
            label="status"
            filterOptions={PROPOSAL_NEW_STATUS_FILTER_OPTIONS.map((pnStatus) => ({
              name: PROPOSAL_NEW_STATUS_DISPLAY_MAP[pnStatus]?.copy?.toUpperCase(),
              value: pnStatus,
            }))}
            appliedFilters={proposalStatusFilters}
            setAppliedFilters={setProposalStatusFilters}
            refetchCallback={() => {
              setProposalPage(0)
              invalidateQuery(getProposalsByAddress)
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
              setProposalPage(0)
              invalidateQuery(getProposalsByAddress)
            }}
          />
        </div>
        {/* PAGINATION */}
        <Pagination
          results={proposals as any[]}
          resultsCount={proposalCount || 0}
          page={proposalPage}
          setPage={setProposalPage}
          resultsLabel="proposals"
          className="ml-0 text-sm self-end"
        />
      </div>
      {/* PROPOSALS TABLE */}
      <table className="min-w-[600px] md:w-full">
        {/* TABLE HEADERS */}
        <thead className="overflow-x-auto min-w-[600px]">
          <tr className="border-t border-b border-wet-concrete">
            <th className="pl-4 w-96 text-xs tracking-wide uppercase text-concrete py-2 text-left">
              Title
            </th>
            <th className="w-64 text-xs tracking-wide uppercase text-concrete py-2 text-left">
              Proposal status
            </th>
            <th className="w-40 text-xs tracking-wide uppercase text-concrete py-2 text-left">
              Payment
            </th>
            <th className="text-xs tracking-wide uppercase text-concrete py-2 text-left">
              Last updated
            </th>
            {/* title-less header for role pfps */}
            <th />
          </tr>
        </thead>
        {/* TABLE BODY */}
        <tbody>
          {proposals &&
            proposals.length > 0 &&
            proposals.map((proposal, idx) => {
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
                      <ProposalStatusIndicator
                        status={proposal?.status}
                        participants={proposal?.participants}
                      />
                    </td>
                    {/* PAYMENT */}
                    <td className="text-base py-4">
                      {proposal.data.totalPayments && proposal.data?.totalPayments?.length > 0
                        ? `${formatCurrencyAmount(
                            proposal.data?.totalPayments[0]?.amount?.toString()
                          )} ${proposal.data?.totalPayments[0]?.token?.symbol}`
                        : "None"}
                    </td>
                    {/* LAST UPDATED */}
                    <td className="text-base py-4">{formatDate(proposal.timestamp)}</td>
                    {/* COLLABORATORS */}
                    <td className="pr-12">
                      <div className="flex">
                        <CollaboratorPfps accounts={proposal?.participants} size={Sizes.BASE} />
                      </div>
                    </td>
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
      {proposals &&
        proposals.length === 0 &&
        (proposalStatusFilters.size || proposalRoleFilters.size ? (
          <div className="w-full h-3/4 flex items-center flex-col sm:justify-center mt-3 sm:mt-0">
            <p className="text-2xl font-bold w-[295px] text-center">No matches</p>
          </div>
        ) : (
          <div className="w-full h-3/4 flex items-center flex-col sm:justify-center mt-8 sm:mt-0">
            <p className="text-2xl font-bold w-[295px] text-center">No proposals</p>
          </div>
        ))}
    </>
  )
}

WorkspaceHome.suppressFirstRenderFlicker = true
WorkspaceHome.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return (
    <Layout title="Workspace">
      <div className="flex flex-col md:flex-row h-full">
        <WorkspaceSidebar />
        <div className="p-5 md:p-10 w-full max-h-screen overflow-y-auto">{page}</div>
      </div>
    </Layout>
  )
}
export default WorkspaceHome
