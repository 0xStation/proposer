import { useParam, useQuery } from "blitz"
import { ProposalViewHeaderNavigation } from "app/proposalNew/components/viewPage/ProposalViewHeaderNavigation"
import { BlitzPage } from "blitz"
import Layout from "app/core/layouts/Layout"
import getProposalNewById from "app/proposalNew/queries/getProposalNewById"

export const ProposalPayments: BlitzPage = () => {
  const proposalId = useParam("proposalId") as string
  const [proposal] = useQuery(
    getProposalNewById,
    { id: proposalId },
    { suspense: false, refetchOnWindowFocus: false, refetchOnReconnect: false }
  )
  return (
    <Layout title="View Payments">
      <div className="w-full md:min-w-1/2 md:max-w-2xl mx-auto h-full">
        <ProposalViewHeaderNavigation />
        <div className="w-full h-full flex items-center flex-col sm:mt-0">
          <p className="text-2xl font-bold w-[295px] text-center mt-44">No payments queued</p>
          <p className="text-base w-[320px] text-center">
            Payments queue and history will be displayed here after the proposal has been signed by
            all collaborators.
          </p>
        </div>
      </div>
    </Layout>
  )
}

ProposalPayments.suppressFirstRenderFlicker = true
export default ProposalPayments
