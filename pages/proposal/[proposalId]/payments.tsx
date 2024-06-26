import { gSSP } from "app/blitz-server"
import { useQuery, invoke } from "@blitzjs/rpc"
import { useParam, BlitzPage } from "@blitzjs/next"
import { ProposalStatus } from "@prisma/client"
import Layout from "app/core/layouts/Layout"
import getProposalById from "app/proposal/queries/getProposalById"
import ProposalMilestonePaymentBox from "app/core/components/ProposalMilestonePaymentBox"
import { Proposal } from "app/proposal/types"
import getMilestonesByProposal from "app/proposalMilestone/queries/getMilestonesByProposal"
import { ProposalNestedLayout } from "app/core/layouts/ProposalNestedLayout"

export const getServerSideProps = gSSP(async ({ params = {} }) => {
  const { proposalId } = params
  // regex checks if a string is a uuid
  // https://melvingeorge.me/blog/check-if-string-valid-uuid-regex-javascript
  const isUuidRegex =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi

  if (!proposalId || !isUuidRegex.test(proposalId as string)) {
    return {
      notFound: true,
    }
  }

  const proposal = await invoke(getProposalById, {
    id: proposalId,
  })

  if (!proposal) {
    return {
      notFound: true,
    }
  }

  return {
    props: { isDeleted: proposal.deleted }, // will be passed to the page component as props
  }
})

export const ProposalPayments: BlitzPage = () => {
  const proposalId = useParam("proposalId") as string
  const [proposal] = useQuery(
    getProposalById,
    { id: proposalId },
    {
      suspense: false,
      enabled: !!proposalId,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 60 * 1000, // 1 minute
    }
  )

  const [milestones] = useQuery(
    getMilestonesByProposal,
    { proposalId: proposalId },
    {
      suspense: false,
      enabled: !!proposal?.id,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 60 * 1000, // 1 minute
    }
  )

  const proposalContainsPayment = (proposal?.payments && proposal?.payments.length > 0) || false

  const showPayInformation =
    proposalContainsPayment &&
    (proposal?.status === ProposalStatus.APPROVED || proposal?.status === ProposalStatus.COMPLETE)

  return (
    <>
      {showPayInformation && milestones ? (
        milestones.map((milestone, i) => (
          <ProposalMilestonePaymentBox
            key={i}
            proposal={proposal as Proposal}
            milestone={milestone}
            className="mt-9"
          />
        ))
      ) : Boolean(proposal?.roles) ? (
        <div className="w-full h-full flex items-center flex-col sm:mt-0">
          <h1 className="text-2xl font-bold w-[295px] text-center mt-44">No payments queued</h1>
          <p className="text-base w-[320px] text-center mt-2.5">
            Payments queue and history will be displayed here after the proposal has been signed by
            all collaborators.
          </p>
        </div>
      ) : (
        <div className="mt-9 h-[260px] w-full flex flex-row rounded-2xl bg-wet-concrete shadow border-solid motion-safe:animate-pulse" />
      )}
    </>
  )
}

ProposalPayments.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return (
    <Layout title="Proposal Payments">
      <ProposalNestedLayout>{page}</ProposalNestedLayout>
    </Layout>
  )
}

ProposalPayments.suppressFirstRenderFlicker = true
export default ProposalPayments
