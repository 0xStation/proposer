import { gSSP } from "app/blitz-server"
import { useQuery, invoke } from "@blitzjs/rpc"
import { BlitzPage, useParam } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import getProposalById from "app/proposal/queries/getProposalById"
import ReadMore from "app/core/components/ReadMore"
import { TotalPaymentView } from "app/core/components/TotalPaymentView"
import RoleSignaturesView from "app/core/components/RoleSignaturesView"
import { Proposal } from "app/proposal/types"
import { ProposalNestedLayout } from "app/core/components/ProposalNestedLayout"

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
    props: {}, // will be passed to the page component as props
  }
})

const ViewProposal: BlitzPage = () => {
  const proposalId = useParam("proposalId") as string
  const [proposal] = useQuery(
    getProposalById,
    { id: proposalId },
    {
      suspense: false,
      enabled: !!proposalId,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  )

  return (
    <>
      <ReadMore className="mt-9 mb-9">{proposal?.data?.content?.body}</ReadMore>
      <RoleSignaturesView proposal={proposal as Proposal} className="mt-9" />
      {(proposal?.data.totalPayments || []).length > 0 && (
        <TotalPaymentView proposal={proposal!} className="mt-9" />
      )}
    </>
  )
}

ViewProposal.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return (
    <Layout title="View Proposal">
      <ProposalNestedLayout>{page}</ProposalNestedLayout>
    </Layout>
  )
}

ViewProposal.suppressFirstRenderFlicker = true

export default ViewProposal
