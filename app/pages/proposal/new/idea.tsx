import { BlitzPage, useRouterQuery } from "blitz"
import Layout from "app/core/layouts/Layout"
import ProposalNonFundingForm from "app/proposalForm/components/nonFunding/form"

const ProposalNewIdea: BlitzPage = () => {
  const queryParams = useRouterQuery()
  const clients = (queryParams?.clients as string)?.split(",").filter((s) => !!s) || []
  const title = queryParams?.title as string

  return (
    <Layout title="New Proposal">
      <ProposalNonFundingForm prefillClients={clients} prefillTitle={title} />
    </Layout>
  )
}

ProposalNewIdea.suppressFirstRenderFlicker = true

export default ProposalNewIdea
