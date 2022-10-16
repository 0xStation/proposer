import { BlitzPage, useQuery, useRouterQuery } from "blitz"
import Layout from "app/core/layouts/Layout"
import FoxesProposalForm from "app/proposalForm/components/foxes/form"
import getRfpById from "app/rfp/queries/getRfpById"

const CreateFoxesProposal: BlitzPage = () => {
  return (
    <Layout title="New Proposal">
      <FoxesProposalForm />
    </Layout>
  )
}

CreateFoxesProposal.suppressFirstRenderFlicker = true

export default CreateFoxesProposal
