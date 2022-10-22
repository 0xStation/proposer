import { useRouter } from "next/router"
import { BlitzPage } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import ProposalFundingForm from "app/proposalForm/components/funding/form"

const CreateFundingProposal: BlitzPage = () => {
  const queryParams = useRouter().query
  const clients = (queryParams?.clients as string)?.split(",").filter((s) => !!s) || []
  const contributors = (queryParams?.contributors as string)?.split(",").filter((s) => !!s) || []

  return (
    <Layout title="New Proposal">
      <ProposalFundingForm prefillClients={clients} prefillContributors={contributors} />
    </Layout>
  )
}

CreateFundingProposal.suppressFirstRenderFlicker = true

export default CreateFundingProposal
