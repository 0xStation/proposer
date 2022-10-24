import { BlitzPage, useRouterQuery } from "blitz"
import Layout from "app/core/layouts/Layout"
import ProposalFundingForm from "app/proposalForm/components/funding/form"

const ProposalNewFunding: BlitzPage = () => {
  const queryParams = useRouterQuery()
  const clients = (queryParams?.clients as string)?.split(",").filter((s) => !!s) || []
  const contributors = (queryParams?.contributors as string)?.split(",").filter((s) => !!s) || []

  return (
    <Layout title="New Proposal">
      <ProposalFundingForm prefillClients={clients} prefillContributors={contributors} />
    </Layout>
  )
}

ProposalNewFunding.suppressFirstRenderFlicker = true

export default ProposalNewFunding
