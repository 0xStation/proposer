import { useRouter } from "next/router"
import { BlitzPage } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import ProposalFormIdea from "app/proposalForm/components/idea/form"

const ProposalNewIdea: BlitzPage = () => {
  const queryParams = useRouter().query
  const clients = (queryParams?.clients as string)?.split(",").filter((s) => !!s) || []
  const title = queryParams?.title as string

  return (
    <Layout title="New Proposal">
      <ProposalFormIdea prefillClients={clients} prefillTitle={title} />
    </Layout>
  )
}

ProposalNewIdea.suppressFirstRenderFlicker = true

export default ProposalNewIdea
