import { BlitzPage, useRouterQuery } from "blitz"
import Layout from "app/core/layouts/Layout"
import { ProposalForm } from "app/proposal/components/ProposalForm"

const CreateProposal: BlitzPage = () => {
  const queryParams = useRouterQuery()
  const clients = (queryParams?.clients as string)?.split(",").filter((s) => !!s) || []
  const contributors = (queryParams?.contributors as string)?.split(",").filter((s) => !!s) || []

  return (
    <Layout title="New Proposal">
      <ProposalForm
        initialValues={{
          client: clients?.[0] || "",
          contributor: contributors?.[0] || "",
        }}
      />
    </Layout>
  )
}

CreateProposal.suppressFirstRenderFlicker = true

export default CreateProposal
