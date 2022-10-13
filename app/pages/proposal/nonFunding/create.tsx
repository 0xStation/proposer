import { BlitzPage, useRouterQuery } from "blitz"
import Layout from "app/core/layouts/Layout"
import ProposalNonFundingForm from "app/proposalForm/components/nonFunding/form"

const CreateNonFundingProposal: BlitzPage = () => {
  const queryParams = useRouterQuery()
  const clients = (queryParams?.clients as string)?.split(",").filter((s) => !!s) || []

  return (
    <Layout title="New Proposal">
      <ProposalNonFundingForm prefillClients={clients} />
    </Layout>
  )
}

CreateNonFundingProposal.suppressFirstRenderFlicker = true

export default CreateNonFundingProposal
