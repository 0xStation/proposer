import { ProposalViewHeaderNavigation } from "app/proposalNew/components/viewPage/ProposalViewHeaderNavigation"
import { BlitzPage } from "blitz"
import Layout from "app/core/layouts/Layout"

export const ProposalPayments: BlitzPage = () => {
  return (
    <Layout title="View Payments">
      <div className="w-full md:min-w-1/2 md:max-w-2xl mx-auto h-full">
        <ProposalViewHeaderNavigation />
      </div>
    </Layout>
  )
}

ProposalPayments.suppressFirstRenderFlicker = true
export default ProposalPayments
