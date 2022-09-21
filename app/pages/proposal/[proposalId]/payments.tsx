import { useParam, useQuery, BlitzPage } from "blitz"
import { ProposalViewHeaderNavigation } from "app/proposalNew/components/viewPage/ProposalViewHeaderNavigation"
import Layout from "app/core/layouts/Layout"
import getProposalNewById from "app/proposalNew/queries/getProposalNewById"
import { ProposalNewStatus } from "@prisma/client"
import ProposalPaymentView from "app/core/components/ProposalPaymentView"
import { ProposalNew } from "app/proposalNew/types"

export const ProposalPayments: BlitzPage = () => {
  const proposalId = useParam("proposalId") as string
  const [proposal] = useQuery(
    getProposalNewById,
    { id: proposalId },
    {
      suspense: false,
      enabled: !!proposalId,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  )

  const proposalContainsPayment = (proposal?.payments && proposal?.payments.length > 0) || false

  const showPayInformation =
    proposalContainsPayment &&
    (proposal?.status === ProposalNewStatus.APPROVED || ProposalNewStatus.COMPLETE)

  return (
    <Layout title="View Payments">
      <div className="w-full md:min-w-1/2 md:max-w-2xl mx-auto h-full">
        <ProposalViewHeaderNavigation />
        {showPayInformation ? (
          <ProposalPaymentView proposal={proposal as ProposalNew} className="mt-9" />
        ) : Boolean(proposal?.roles) ? (
          <div className="w-full h-full flex items-center flex-col sm:mt-0">
            <h1 className="text-2xl font-bold w-[295px] text-center mt-44">No payments queued</h1>
            <p className="text-base w-[320px] text-center mt-2.5">
              Payments queue and history will be displayed here after the proposal has been signed
              by all collaborators.
            </p>
          </div>
        ) : (
          <div className="mt-9 h-[260px] w-full flex flex-row rounded-2xl bg-wet-concrete shadow border-solid motion-safe:animate-pulse" />
        )}
      </div>
    </Layout>
  )
}

ProposalPayments.suppressFirstRenderFlicker = true
export default ProposalPayments
