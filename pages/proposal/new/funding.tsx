import { useRouter } from "next/router"
import { BlitzPage } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import ProposalFormFunding from "app/proposalForm/components/funding/form"

const ProposalNewFunding: BlitzPage = () => {
  const queryParams = useRouter().query
  const clients = (queryParams?.clients as string)?.split(",").filter((s) => !!s) || []
  const contributors = (queryParams?.contributors as string)?.split(",").filter((s) => !!s) || []

  return <ProposalFormFunding prefillClients={clients} prefillContributors={contributors} />
}

ProposalNewFunding.suppressFirstRenderFlicker = true
ProposalNewFunding.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return <Layout title="New Proposal">{page}</Layout>
}

export default ProposalNewFunding
