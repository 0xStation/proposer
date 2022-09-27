import { BlitzPage, useQuery, useParam } from "blitz"
import Layout from "app/core/layouts/Layout"
import getProposalById from "app/proposal/queries/getProposalById"
import { ProposalViewHeaderNavigation } from "app/proposal/components/viewPage/ProposalViewHeaderNavigation"
import ReadMore from "app/core/components/ReadMore"
import { TotalPaymentView } from "app/core/components/TotalPaymentView"
import RoleSignaturesView from "app/core/components/RoleSignaturesView"
import { Proposal } from "app/proposal/types"
import { IpfsHashView } from "app/core/components/IpfsHashView"
import TimelineView from "app/core/components/TimelineView"

const ViewProposal: BlitzPage = () => {
  const proposalId = useParam("proposalId") as string
  const [proposal] = useQuery(
    getProposalById,
    { id: proposalId },
    { suspense: false, refetchOnWindowFocus: false, refetchOnReconnect: false }
  )

  return (
    <Layout title="View Proposal">
      <div className="w-full md:min-w-1/2 md:max-w-2xl mx-auto pb-9">
        <ProposalViewHeaderNavigation />
        <ReadMore className="mt-9 mb-9">{proposal?.data?.content?.body}</ReadMore>
        <RoleSignaturesView proposal={proposal as Proposal | undefined} className="mt-9" />
        {(proposal?.data.totalPayments || []).length > 0 && (
          <TotalPaymentView proposal={proposal!} className="mt-9" />
        )}
        {proposal?.startDate && (
          <TimelineView
            startDate={proposal?.startDate as Date}
            endDate={proposal?.endDate as Date}
          />
        )}
      </div>
    </Layout>
  )
}

ViewProposal.suppressFirstRenderFlicker = true

export default ViewProposal
