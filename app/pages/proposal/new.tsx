import { BlitzPage } from "blitz"
import Layout from "app/core/layouts/Layout"
import { ProposalForm } from "app/proposal/components/ProposalForm"

const CreateProposal: BlitzPage = () => {
  return (
    <Layout title="New Proposal">
      <ProposalForm />
    </Layout>
  )
}

CreateProposal.suppressFirstRenderFlicker = true

export default CreateProposal
