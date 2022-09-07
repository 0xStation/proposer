import { BlitzPage } from "blitz"
import TempLayout from "app/core/layouts/TempLayout"
import { ProposalNewForm } from "app/proposalNew/components/ProposalNewForm"

const CreateProposalNew: BlitzPage = () => {
  return (
    <TempLayout title="New Proposal">
      <ProposalNewForm />
    </TempLayout>
  )
}

CreateProposalNew.suppressFirstRenderFlicker = true

export default CreateProposalNew
