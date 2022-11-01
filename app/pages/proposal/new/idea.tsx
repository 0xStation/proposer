import { BlitzPage, useRouterQuery } from "blitz"
import Layout from "app/core/layouts/Layout"
import ProposalFormIdea from "app/proposalForm/components/idea/form"

const ProposalNewIdea: BlitzPage = () => {
  const queryParams = useRouterQuery()
  const clients = (queryParams?.clients as string)?.split(",").filter((s) => !!s) || []
  const title = queryParams?.title as string

  return (
    <Layout title="New proposal">
      <ProposalFormIdea prefillClients={clients} prefillTitle={title} />
    </Layout>
  )
}

ProposalNewIdea.suppressFirstRenderFlicker = true

export default ProposalNewIdea
