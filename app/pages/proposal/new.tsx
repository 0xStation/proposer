import { BlitzPage } from "blitz"
import Layout from "app/core/layouts/Layout"
import { ProposalNewForm } from "app/proposalNew/components/ProposalNewForm"

const CreateProposalNew: BlitzPage = () => {
  return (
    <Layout title="New Proposal">
      <ProposalNewForm />
    </Layout>
  )
}

CreateProposalNew.suppressFirstRenderFlicker = true

export default CreateProposalNew
