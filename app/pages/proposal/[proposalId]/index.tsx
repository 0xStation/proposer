import { BlitzPage, useQuery, useParam } from "blitz"
import { ExternalLinkIcon } from "@heroicons/react/solid"
import { DateTime } from "luxon"
import Layout from "app/core/layouts/Layout"
import useStore from "app/core/hooks/useStore"
import getProposalNewById from "app/proposalNew/queries/getProposalNewById"
import { LINKS } from "app/core/utils/constants"
import { ProposalViewHeaderNavigation } from "app/proposalNew/components/viewPage/ProposalViewHeaderNavigation"
import ReadMore from "app/core/components/ReadMore"
import { TotalPaymentView } from "app/core/components/TotalPaymentView"
import RoleSignaturesView from "app/core/components/RoleSignaturesView"
import { ProposalNew } from "app/proposalNew/types"
import ApproveProposalNewModal from "app/proposalNew/components/ApproveProposalNewModal"
import { IpfsHashView } from "app/core/components/IpfsHashView"
import TimelineView from "app/core/components/TimelineView"

const ViewProposalNew: BlitzPage = () => {
  const proposalApprovalModalOpen = useStore((state) => state.proposalApprovalModalOpen)
  const toggleProposalApprovalModalOpen = useStore((state) => state.toggleProposalApprovalModalOpen)
  const proposalId = useParam("proposalId") as string
  const [proposal] = useQuery(
    getProposalNewById,
    { id: proposalId },
    { suspense: false, refetchOnWindowFocus: false, refetchOnReconnect: false }
  )

  return (
    <Layout title="View Proposal">
      <div className="w-full md:min-w-1/2 md:max-w-2xl mx-auto pb-9">
        <ApproveProposalNewModal
          isOpen={proposalApprovalModalOpen}
          setIsOpen={toggleProposalApprovalModalOpen}
          proposal={proposal}
        />
        <ProposalViewHeaderNavigation />
        <ReadMore className="mt-9 mb-9">{proposal?.data?.content?.body}</ReadMore>
        {proposal?.startDate && (
          <TimelineView
            startDate={proposal?.startDate as Date}
            endDate={proposal?.endDate as Date}
          />
        )}
        <TotalPaymentView proposal={proposal!} className="mt-9" />
        <RoleSignaturesView proposal={proposal as ProposalNew | undefined} className="mt-9" />
        <IpfsHashView proposal={proposal || undefined} />
      </div>
    </Layout>
  )
}

ViewProposalNew.suppressFirstRenderFlicker = true

export default ViewProposalNew
