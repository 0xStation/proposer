import { BlitzPage, useRouterQuery } from "blitz"
import Layout from "app/core/layouts/Layout"
import ProposalFormPartnership from "app/proposalForm/components/partnership/form"

const ProposalNewPartnership: BlitzPage = () => {
  const queryParams = useRouterQuery()
  const clients = (queryParams?.clients as string)?.split(",").filter((s) => !!s) || []
  const contributors = (queryParams?.contributors as string)?.split(",").filter((s) => !!s) || []
  const title = queryParams?.title as string

  return (
    <Layout title="New Proposal">
      <ProposalFormPartnership
        prefillClients={clients}
        prefillContributors={contributors}
        prefillTitle={title}
      />
    </Layout>
  )
}

ProposalNewPartnership.suppressFirstRenderFlicker = true

export default ProposalNewPartnership
