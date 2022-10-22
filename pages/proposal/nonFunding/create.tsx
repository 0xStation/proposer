import { useRouter } from "next/router"
import { BlitzPage } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import ProposalNonFundingForm from "app/proposalForm/components/nonFunding/form"

const CreateNonFundingProposal: BlitzPage = () => {
  const queryParams = useRouter().query
  const clients = (queryParams?.clients as string)?.split(",").filter((s) => !!s) || []
  const title = queryParams?.title as string

  return (
    <Layout title="New Proposal">
      <ProposalNonFundingForm prefillClients={clients} prefillTitle={title} />
    </Layout>
  )
}

CreateNonFundingProposal.suppressFirstRenderFlicker = true

export default CreateNonFundingProposal
