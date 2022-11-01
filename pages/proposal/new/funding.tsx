import { useRouter } from "next/router"
import { BlitzPage } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import ProposalFormFunding from "app/proposalForm/components/funding/form"

const ProposalNewFunding: BlitzPage = () => {
  const queryParams = useRouter().query
  const clients = (queryParams?.clients as string)?.split(",").filter((s) => !!s) || []
  const contributors = (queryParams?.contributors as string)?.split(",").filter((s) => !!s) || []

  return (
    <Layout title="New Proposal">
      <ProposalFormFunding prefillClients={clients} prefillContributors={contributors} />
    </Layout>
  )
}

ProposalNewFunding.suppressFirstRenderFlicker = true

export default ProposalNewFunding
