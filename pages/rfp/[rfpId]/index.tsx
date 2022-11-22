import { gSSP } from "app/blitz-server"
import Link from "next/link"
import { useQuery, invoke } from "@blitzjs/rpc"
import { BlitzPage, useParam, Routes } from "@blitzjs/next"
import { useState } from "react"
import Layout from "app/core/layouts/Layout"
import { formatDate } from "app/core/utils/formatDate"
import Pagination from "app/core/components/Pagination"
import { ProposalStatus, ProposalRoleApprovalStatus } from "@prisma/client"
import ProposalStatusPill from "app/core/components/ProposalStatusPill"
import { CollaboratorPfps } from "app/core/components/CollaboratorPfps"
import { ProposalRole } from "app/proposalRole/types"
import { formatCurrencyAmount } from "app/core/utils/formatCurrencyAmount"
import ProgressCircleAndNumber from "app/core/components/ProgressCircleAndNumber"
import getRfpById from "app/rfp/queries/getRfpById"
import getProposalsByRfpId from "app/proposal/queries/getProposalsByRfpId"
import { Sizes } from "app/core/utils/constants"
import getProposalCountByRfpId from "app/proposal/queries/getProposalCountByRfpId"
import RfpSidebarLayout from "app/core/layouts/RfpSidebarLayout"
import { RfpNavigator } from "app/rfp/components/RfpNavigator"

export const getServerSideProps = gSSP(async ({ params = {} }) => {
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
})

const RfpDetail: BlitzPage = () => {
  const [page, setPage] = useState<number>(0)
  const rfpId = useParam("rfpId", "string") as string

  const [proposals] = useQuery(
    getProposalsByRfpId,
    {
      rfpId: rfpId,
    },
    { enabled: !!rfpId, suspense: false, refetchOnWindowFocus: false }
  )

  const [proposalCount] = useQuery(
    getProposalCountByRfpId,
    {
      rfpId: rfpId as string,
    },
    {
      enabled: !!rfpId,
      suspense: false,
      refetchOnWindowFocus: false,
    }
  )

  return (
    <>
      <div className="mb-4 border-b border-wet-concrete pb-4 flex flex-row justify-end">
        <Pagination
          results={proposals as any[]}
          resultsCount={proposalCount || 0}
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
                        ? proposal.data.content.title.substring(0, 44) + "..."
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
    </>
  )
}

RfpDetail.suppressFirstRenderFlicker = true
RfpDetail.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return (
    <Layout title="RFP">
      <RfpSidebarLayout>
        <RfpNavigator />
        {page}
      </RfpSidebarLayout>
    </Layout>
  )
}
export default RfpDetail
