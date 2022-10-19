import { useState } from "react"
import {
  BlitzPage,
  useParam,
  useQuery,
  Routes,
  Link,
  GetServerSideProps,
  invoke,
  Image,
} from "blitz"
import Layout from "app/core/layouts/Layout"
import Button from "app/core/components/sds/buttons/Button"
import { formatDate } from "app/core/utils/formatDate"
import Pagination from "app/core/components/Pagination"
import { Sizes } from "app/core/utils/constants"
import { ProposalStatus, ProposalRoleApprovalStatus, RfpStatus } from "@prisma/client"
import useStore from "app/core/hooks/useStore"
import ProposalStatusPill from "app/core/components/ProposalStatusPill"
import { CollaboratorPfps } from "app/core/components/CollaboratorPfps"
import { ProposalRole } from "app/proposalRole/types"
import { formatCurrencyAmount } from "app/core/utils/formatCurrencyAmount"
import ProgressCircleAndNumber from "app/core/components/ProgressCircleAndNumber"
import getRfpById from "app/rfp/queries/getRfpById"
import getProposalsByRfpId from "app/proposal/queries/getProposalsByRfpId"
import RfpStatusPill from "app/rfp/components/RfpStatusPill"
import BackIcon from "/public/back-icon.svg"
import { getPaymentAmount, getPaymentToken } from "app/template/utils"
import { getNetworkExplorer, getNetworkName } from "app/core/utils/networkInfo"
import getAccountHasMinTokenBalance from "app/token/queries/getAccountHasMinTokenBalance"
import ReadMore from "app/core/components/ReadMore"
import { WorkspaceTab } from "app/pages/workspace/[accountAddress]"
import TextLink from "app/core/components/TextLink"

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

  const [userHasRequiredToken] = useQuery(
    getAccountHasMinTokenBalance,
    {
      chainId: rfp?.data?.singleTokenGate?.token?.chainId as number,
      tokenAddress: rfp?.data?.singleTokenGate?.token?.address as string,
      accountAddress: activeUser?.address as string,
      minBalance: rfp?.data?.singleTokenGate?.minBalance || "1", // string to pass directly into BigNumber.from in logic check
    },
    {
      enabled: !!activeUser?.address && !!rfp?.data?.singleTokenGate,
      suspense: false,
      refetchOnWindowFocus: false,
      cacheTime: 60 * 1000, // 1 minute
    }
  )

  return (
    <Layout>
      {/* LEFT SIDEBAR | PROPOSALS */}
      <div className="flex flex-row h-full">
        {/* LEFT SIDEBAR */}
        <div className="h-full w-[288px] overflow-y-scroll p-6 border-r border-concrete">
          <div className="flex flex-col pb-6 space-y-6">
            {/* BACK */}
            <Link
              href={Routes.WorkspaceHome({
                accountAddress: rfp?.accountAddress as string,
                tab: WorkspaceTab.RFPS,
              })}
            >
              <div className="h-[16px] w-[16px] cursor-pointer">
                <Image src={BackIcon} alt="Back icon" />
              </div>
            </Link>
            {/* TITLE */}
            {rfp ? (
              <span className="mt-6 text-2xl font-bold text-marble-white">
                {rfp?.data.content.title}
              </span>
            ) : (
              // LOADING STATE
              <div
                tabIndex={0}
                className={`h-8 w-full rounded-lg flex flex-row bg-wet-concrete shadow border-solid motion-safe:animate-pulse`}
              />
            )}
            {/* STATUS PILL */}
            {rfp ? (
              <RfpStatusPill status={rfp?.status} />
            ) : (
              // LOADING STATE
              <div
                tabIndex={0}
                className={`h-6 w-1/3 rounded-xl flex flex-row bg-wet-concrete shadow border-solid motion-safe:animate-pulse`}
              />
            )}
            {/* CTA */}
            <div className="mb-10 relative group">
              <Link href={Routes.CreateFoxesProposal({ rfpId })}>
                <Button
                  className="w-full"
                  isDisabled={
                    rfp?.status === RfpStatus.CLOSED ||
                    (!!rfp?.data?.singleTokenGate && !userHasRequiredToken)
                  }
                >
                  Propose
                </Button>
              </Link>
              {!!rfp?.data?.singleTokenGate && !userHasRequiredToken && (
                <div className="absolute group-hover:block hidden text-xs text-marble-white bg-wet-concrete rounded p-3 mt-2 -mb-5">
                  Only {rfp?.data?.singleTokenGate?.token?.name} holders can propose to this RFP.
                </div>
              )}
            </div>
            {/* METADATA */}
            <div className="pt-6 flex flex-col space-y-6">
              {/* SUBMISSION GUIDELINES */}
              {rfp?.data?.content.submissionGuideline && (
                <div>
                  <h4 className="text-xs font-bold text-concrete uppercase mb-1.5">
                    Submission guidelines
                  </h4>
                  <ReadMore maxCharLength={75}>{rfp?.data?.content.submissionGuideline}</ReadMore>
                  {/* <div className="mt-2">
                    <Preview markdown={rfp?.data?.content.submissionGuideline} />
                  </div> */}
                </div>
              )}
              {/* SUBMISSION REQUIREMENT */}
              {!!rfp?.data?.singleTokenGate && (
                <div>
                  <h4 className="text-xs font-bold text-concrete uppercase mb-1.5">
                    Submission requirement
                  </h4>
                  <div>
                    {`At least ${rfp?.data?.singleTokenGate.minBalance || 1} `}
                    <TextLink
                      url={
                        getNetworkExplorer(rfp?.data?.singleTokenGate.token.chainId) +
                        "/token/" +
                        rfp?.data?.singleTokenGate.token.address
                      }
                    >
                      {rfp?.data?.singleTokenGate.token.name}
                    </TextLink>
                  </div>
                </div>
              )}
              {/* NETWORK */}
              <div>
                <h4 className="text-xs font-bold text-concrete uppercase">Network</h4>
                <p className="mt-1.5">
                  {getNetworkName(getPaymentToken(rfp?.data.template)?.chainId)}
                </p>
              </div>
              {/* PAYMENT TOKEN */}
              <div>
                <h4 className="text-xs font-bold text-concrete uppercase">Payment token</h4>
                <p className="mt-1.5">{getPaymentToken(rfp?.data.template)?.symbol}</p>
              </div>
              {/* PAYMENT AMOUNT */}
              <div>
                <h4 className="text-xs font-bold text-concrete uppercase">Payment amount</h4>
                <p className="mt-1.5">{getPaymentAmount(rfp?.data.template)}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-10 flex-1 max-h-screen overflow-y-auto">
          {/* <h1 className="text-2xl font-bold">Proposals</h1> */}
          <div className="mb-4 border-b border-wet-concrete pb-4 flex flex-row justify-end">
            {/* <div className="space-x-2 flex flex-row">
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
            </div> */}
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
                      href={Routes.ViewProposal({
                        proposalId: proposal.id,
                      })}
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
              <p className="text-2xl font-bold w-1/3 text-center">This RFP has no proposals yet</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

RfpDetail.suppressFirstRenderFlicker = true
export default RfpDetail
