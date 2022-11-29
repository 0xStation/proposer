import { gSSP } from "app/blitz-server"
import Link from "next/link"
import { useRouter } from "next/router"
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
  RFP_STATUS_FILTER_OPTIONS,
  RFP_STATUS_DISPLAY_MAP,
} from "app/core/utils/constants"
import {
  ProposalStatus,
  ProposalRoleApprovalStatus,
  ProposalRoleType,
  RfpStatus,
  Rfp,
} from "@prisma/client"
import { LightBulbIcon, CogIcon, NewspaperIcon } from "@heroicons/react/solid"
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
import getRfpCountForAccount from "app/rfp/queries/getRfpCountForAccount"
import getProposalCountForAccount from "app/proposal/queries/getProposalCountForAccount"
import { RfpCard } from "app/rfp/components/RfpCard"
import useUserHasPermissionOfAddress from "app/core/hooks/useUserHasPermissionOfAddress"
import RfpPreCreateModal from "app/rfp/components/RfpPreCreateModal"
import { RfpProductStatus } from "app/rfp/types"

export enum WorkspaceTab {
  PROPOSALS = "proposals",
  RFPS = "rfps",
  SETTINGS = "settings",
}

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
  const queryParams = useRouter().query
  const tab = queryParams?.tab as string
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(
    (tab as WorkspaceTab) || WorkspaceTab.PROPOSALS
  )

  const { data: accountEnsName } = useEnsName({
    address: accountAddress as `0x${string}`,
    chainId: 1,
    cacheTime: 10 * 60 * 1000, // 10 minutes (time in ms) which the data should remain in the cache
  })

  const [account] = useQuery(
    getAccountByAddress,
    { address: toChecksumAddress(accountAddress) },
    {
      enabled: !!accountAddress,
      suspense: false,
      refetchOnWindowFocus: false,
      cacheTime: 60 * 1000, // 1 minute
    }
  )

  // checks if session address is page's account address or is a signer of the account's Safe
  const { hasPermissionOfAddress: hasPrivateAccess } = useUserHasPermissionOfAddress(
    accountAddress,
    account?.addressType,
    account?.data?.chainId
  )

  const ProposalTab = () => {
    const router = useRouter()
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
      <div className="p-10 flex-1 max-h-screen overflow-y-auto">
        <div className="flex flex-row justify-between">
          <h1 className="text-2xl font-bold">Proposals</h1>
          <Button
            className="w-full px-10"
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
        <div className="mt-8 mb-4 border-b border-wet-concrete pb-4 flex flex-row justify-between">
          {/* FILTERS */}
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
            className="ml-6 sm:ml-0 text-sm self-end"
          />
        </div>
        {/* PROPOSALS TABLE */}
        <table className="w-full">
          {/* TABLE HEADERS */}
          <thead>
            <tr className="border-b border-wet-concrete">
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
        {proposals &&
          proposals.length === 0 &&
          (proposalStatusFilters.size || proposalRoleFilters.size ? (
            <div className="w-full h-3/4 flex items-center flex-col sm:justify-center sm:mt-0">
              <p className="text-2xl font-bold w-[295px] text-center">No matches</p>
            </div>
          ) : (
            <div className="w-full h-3/4 flex items-center flex-col sm:justify-center sm:mt-0">
              <p className="text-2xl font-bold w-[295px] text-center">No proposals</p>
            </div>
          ))}
      </div>
    )
  }

  const RfpTab = () => {
    const RFP_PAGINATION_TAKE = 25
    const [rfpPage, setRfpPage] = useState<number>(0)
    const [rfpStatusFilters, setRfpProductStatuss] = useState<Set<RfpProductStatus>>(
      new Set<RfpProductStatus>()
    )
    const [isRfpPreCreateModalOpen, setIsRfpPreCreateModalOpen] = useState<boolean>(false)

    const [rfps] = useQuery(
      getRfpsForAccount,
      {
        address: toChecksumAddress(accountAddress),
        page: rfpPage,
        paginationTake: RFP_PAGINATION_TAKE,
        statuses: Array.from(rfpStatusFilters),
      },
      {
        enabled: !!accountAddress,
        suspense: false,
        refetchOnWindowFocus: false,
        cacheTime: 60 * 1000, // 1 minute
      }
    )

    const [rfpCount] = useQuery(
      getRfpCountForAccount,
      {
        address: toChecksumAddress(accountAddress),
        statuses: Array.from(rfpStatusFilters),
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
        <RfpPreCreateModal
          isOpen={isRfpPreCreateModalOpen}
          setIsOpen={setIsRfpPreCreateModalOpen}
          accountAddress={accountAddress}
        />
        <div className="p-10 flex-1 max-h-screen overflow-y-auto">
          <div className="flex flex-row justify-between">
            {/* HEADER */}
            <h1 className="text-2xl font-bold">RFPs</h1>
            {/* CTA */}
            {hasPrivateAccess && (
              <Button
                className="w-full px-10"
                overrideWidthClassName="max-w-fit"
                onClick={() => {
                  setIsRfpPreCreateModalOpen(true)
                }}
              >
                Create RFP
              </Button>
            )}
          </div>
          {/* FILTERS & PAGINATION */}
          <div className="mt-8 mb-4 border-b border-wet-concrete pb-4 flex flex-row justify-between">
            {/* FILTERS */}
            <div className="space-x-2 flex flex-row">
              <FilterPill
                label="status"
                filterOptions={RFP_STATUS_FILTER_OPTIONS.map((status) => ({
                  name: RFP_STATUS_DISPLAY_MAP[status]?.copy?.toUpperCase(),
                  value: status,
                }))}
                appliedFilters={rfpStatusFilters}
                setAppliedFilters={setRfpProductStatuss}
                refetchCallback={() => {
                  setRfpPage(0)
                  invalidateQuery(getRfpsForAccount)
                  invalidateQuery(getRfpCountForAccount)
                }}
              />
            </div>
            {/* PAGINATION */}
            <Pagination
              results={rfps as any[]}
              resultsCount={rfpCount || 0}
              page={rfpPage}
              setPage={setRfpPage}
              resultsLabel="rfps"
              paginationTake={RFP_PAGINATION_TAKE}
              className="ml-6 sm:ml-0 text-sm self-end"
            />
          </div>
          {/* RFP CARDS */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 sm:gap-2 md:gap-4 lg:gap-6 gap-1">
            {rfps &&
              rfps?.length > 0 &&
              rfps?.map((rfp, idx) => {
                return (
                  <RfpCard
                    key={idx}
                    account={account!}
                    rfp={rfp}
                    href={Routes.RfpDetail({ rfpId: rfp.id })}
                  />
                )
              })}
            {/* RFP LOADING */}
            {!rfps &&
              Array.from(Array(9)).map((idx) => (
                <div
                  key={idx}
                  tabIndex={0}
                  className="h-36 rounded-md overflow-hidden bg-wet-concrete shadow border-solid motion-safe:animate-pulse"
                />
              ))}
          </div>
          {/* RFP EMPTY */}
          {rfps &&
            rfps.length === 0 &&
            (rfpStatusFilters.size ? (
              <div className="w-full h-3/4 flex items-center flex-col sm:justify-center sm:mt-0">
                <p className="text-2xl font-bold w-[295px] text-center">No matches</p>
              </div>
            ) : (
              <div className="w-full h-3/4 flex items-center flex-col sm:justify-center sm:mt-0">
                <p className="text-2xl font-bold w-[295px] text-center">No RFPs</p>
              </div>
            ))}
        </div>
      </>
    )
  }

  const SettingsTab = () => {
    return (
      <div className="overflow-auto p-10 flex-1">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="mt-10">
          <WorkspaceSettingsOverviewForm account={account as Account} isEdit={true} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-row h-full">
      {/* LEFT SIDEBAR */}
      <div className="h-full w-[288px] border-r border-concrete p-6">
        <div className="pb-6 border-b border-wet-concrete space-y-6">
          {/* PROFILE */}
          {account ? (
            <AccountMediaObject account={account} showActionIcons={true} />
          ) : (
            // LOADING STATE
            <div
              tabIndex={0}
              className={`h-10 w-full rounded-4xl flex flex-row bg-wet-concrete shadow border-solid motion-safe:animate-pulse`}
            />
          )}
          {/* CTA */}
          {/* {
              // activeTab !== WorkspaceTab.RFPS &&
              <Link
                href={Routes.ProposalTypeSelection({
                  // pre-fill for both so that if user changes toggle to reverse roles, the input address is still there
                  clients: accountEnsName || accountAddress,
                  contributors: accountEnsName || accountAddress,
                })}
              >
                <Button className="w-full">Propose</Button>
              </Link>
            } */}
        </div>
        {/* TABS */}
        <ul className="mt-6 space-y-2">
          {/* PROPOSALS */}
          <li
            className={`p-2 rounded flex flex-row items-center space-x-2 cursor-pointer ${
              activeTab === WorkspaceTab.PROPOSALS && "bg-wet-concrete"
            }`}
            onClick={() => setActiveTab(WorkspaceTab.PROPOSALS)}
          >
            <LightBulbIcon className="h-5 w-5 text-white cursor-pointer" />
            <span>Proposals</span>
          </li>
          {/* RFPS */}
          <li
            className={`p-2 rounded flex flex-row items-center space-x-2 cursor-pointer ${
              activeTab === WorkspaceTab.RFPS && "bg-wet-concrete"
            }`}
            onClick={() => setActiveTab(WorkspaceTab.RFPS)}
          >
            <NewspaperIcon className="h-5 w-5 text-white cursor-pointer" />
            <span>RFPs</span>
          </li>
          {/* SETTINGS */}
          {hasPrivateAccess && (
            <li
              className={`p-2 rounded flex flex-row items-center space-x-2 cursor-pointer ${
                activeTab === WorkspaceTab.SETTINGS && "bg-wet-concrete"
              }`}
              onClick={() => setActiveTab(WorkspaceTab.SETTINGS)}
            >
              <CogIcon className="h-5 w-5 text-white cursor-pointer" />
              <span>Settings</span>
            </li>
          )}
        </ul>
      </div>
      {/* TAB CONTENT */}
      {activeTab === WorkspaceTab.PROPOSALS && <ProposalTab />}
      {activeTab === WorkspaceTab.RFPS && <RfpTab />}
      {activeTab === WorkspaceTab.SETTINGS && <SettingsTab />}
    </div>
  )
}

WorkspaceHome.suppressFirstRenderFlicker = true
WorkspaceHome.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return <Layout title="Workspace">{page}</Layout>
}
export default WorkspaceHome
