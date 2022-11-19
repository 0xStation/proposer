import { useRouter } from "next/router"
import { BlitzPage } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import ProposalFormIdea from "app/proposalForm/components/idea/form"

const ProposalNewIdea: BlitzPage = () => {
  const queryParams = useRouter().query
  const clients = (queryParams?.clients as string)?.split(",").filter((s) => !!s) || []
  const title = queryParams?.title as string

  return <ProposalFormIdea prefillClients={clients} prefillTitle={title} />
}

ProposalNewIdea.suppressFirstRenderFlicker = true
ProposalNewIdea.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return <Layout title="New Proposal">{page}</Layout>
}

export default ProposalNewIdea
