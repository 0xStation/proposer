import { BlitzPage } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import ProposalFormRfp from "app/proposalForm/components/rfp/form"
import RfpSidebarLayout from "app/core/layouts/RfpSidebarLayout"

const ProposalRfpForm: BlitzPage = () => {
  return <ProposalFormRfp />
}

ProposalRfpForm.suppressFirstRenderFlicker = true
ProposalRfpForm.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return (
    <Layout title="New Proposal">
      <RfpSidebarLayout>{page}</RfpSidebarLayout>
    </Layout>
  )
}
export default ProposalRfpForm
