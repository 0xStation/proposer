import { useRouter } from "next/router"
import { BlitzPage } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import ProposalFormPartnership from "app/proposalForm/components/partnership/form"

const ProposalNewPartnership: BlitzPage = () => {
  const queryParams = useRouter().query
  const clients = (queryParams?.clients as string)?.split(",").filter((s) => !!s) || []
  const contributors = (queryParams?.contributors as string)?.split(",").filter((s) => !!s) || []
  const title = queryParams?.title as string

  return (
    <ProposalFormPartnership
      prefillClients={clients}
      prefillContributors={contributors}
      prefillTitle={title}
    />
  )
}

ProposalNewPartnership.suppressFirstRenderFlicker = true
ProposalNewPartnership.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return <Layout title="New Proposal">{page}</Layout>
}

export default ProposalNewPartnership