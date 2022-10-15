import { useEffect, useState, useMemo } from "react"
import {
  BlitzPage,
  useParam,
  useQuery,
  invalidateQuery,
  Routes,
  Link,
  GetServerSideProps,
  invoke,
} from "blitz"
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
import {
  AddressType,
  ProposalStatus,
  ProposalRoleApprovalStatus,
  ProposalRoleType,
} from "@prisma/client"
import { LightBulbIcon, CogIcon } from "@heroicons/react/solid"
import AccountMediaObject from "app/core/components/AccountMediaObject"
import WorkspaceSettingsOverviewForm from "app/account/components/WorkspaceSettingsOverviewForm"
import useStore from "app/core/hooks/useStore"
import ProposalStatusPill from "app/core/components/ProposalStatusPill"
import { useAccount, useEnsName } from "wagmi"
import getSafeMetadata from "app/account/queries/getSafeMetadata"
import { CollaboratorPfps } from "app/core/components/CollaboratorPfps"
import { ProposalRole } from "app/proposalRole/types"
import { formatCurrencyAmount } from "app/core/utils/formatCurrencyAmount"
import ProgressCircleAndNumber from "app/core/components/ProgressCircleAndNumber"
import { Account } from "app/account/types"
import { isAddress } from "ethers/lib/utils"
import getRfpsForAccount from "app/rfp/queries/getRfpsForAccount"
import getRfpById from "app/rfp/queries/getRfpById"
import getProposalsByRfpId from "app/proposal/queries/getProposalsByRfpId"

export const getServerSideProps: GetServerSideProps = async ({ params = {} }) => {
  const { rfpId } = params

  if (!rfpId) {
    return {
      notFound: true,
    }
  }

  const rfp = await invoke(getRfpById, {
    id: rfpId,
  })

  if (!rfp) {
    return {
      notFound: true,
    }
  }

  return {
    props: {}, // will be passed to the page component as props
  }
}

const RfpDetail: BlitzPage = () => {
  const activeUser = useStore((state) => state.activeUser)
  const accountData = useAccount()
  const connectedAddress = useMemo(() => accountData?.address || undefined, [accountData?.address])
  const [canViewSettings, setCanViewSettings] = useState<boolean>(false)
  const [proposalStatusFilters, setProposalStatusFilters] = useState<Set<ProposalStatus>>(
    new Set<ProposalStatus>()
  )
  const [proposalRoleFilters, setProposalRoleFilters] = useState<Set<ProposalRoleType>>(
    new Set<ProposalRoleType>()
  )
  const [page, setPage] = useState<number>(0)
  const rfpId = useParam("rfpId", "string") as string

  const [rfp] = useQuery(
    getRfpById,
    {
      id: rfpId,
    },
    { enabled: !!rfpId, suspense: false, refetchOnWindowFocus: false }
  )

  const [proposals] = useQuery(
    getProposalsByRfpId,
    {
      rfpId: rfpId,
    },
    { enabled: !!rfpId, suspense: false, refetchOnWindowFocus: false }
  )

  return (
    <Layout>
      <div className="flex flex-row h-full">
        {/* LEFT SIDEBAR */}
        <div className="h-full w-[288px] border-r border-concrete p-6">
          <div className="pb-6 border-b border-concrete space-y-6">
            {/* TITLE */}
            {rfp ? (
              <span className="text-xl text-marble-white">{rfp?.data.content.title}</span>
            ) : (
              // LOADING STATE
              <div
                tabIndex={0}
                className={`h-10 w-full rounded-4xl flex flex-row bg-wet-concrete shadow border-solid motion-safe:animate-pulse`}
              />
            )}
            {/* CTA */}
            {/* <Link
              href={Routes.ProposalTypeSelection({
                // pre-fill for both so that if user changes toggle to reverse roles, the input address is still there
                clients: accountEnsName || accountAddress,
                contributors: accountEnsName || accountAddress,
              })}
            >
              <Button className="w-full">Propose</Button>
            </Link> */}
          </div>
        </div>
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
                  setPage(0)
                  invalidateQuery(getProposalsByAddress)
                }}
              />
            </div>
            <Pagination
              results={proposals as any[]}
              // TODO: make specific query for count
              resultsCount={proposals?.length || 0}
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
                <th className="pl-4 w-96 text-xs tracking-wide uppercase text-concrete pb-2 text-left">
                  Title
                </th>
                <th className="w-64 text-xs tracking-wide uppercase text-concrete pb-2 text-left">
                  Proposal status
                </th>
                <th className="w-40 text-xs tracking-wide uppercase text-concrete pb-2 text-left">
                  Payment
                </th>
                <th className="text-xs tracking-wide uppercase text-concrete pb-2 text-left">
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
                            {proposal?.status === ProposalStatus.AWAITING_APPROVAL && (
                              <ProgressCircleAndNumber
                                numerator={
                                  proposal?.roles?.filter(
                                    (role) =>
                                      role.approvalStatus === ProposalRoleApprovalStatus.APPROVED ||
                                      role.approvalStatus === ProposalRoleApprovalStatus.SENT
                                  ).length
                                }
                                denominator={proposal?.roles?.length}
                              />
                            )}
                          </div>
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
      </div>
    </Layout>
  )
}

RfpDetail.suppressFirstRenderFlicker = true
export default RfpDetail
