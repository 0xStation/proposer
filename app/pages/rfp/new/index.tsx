import { BlitzPage, useRouterQuery } from "blitz"
import Layout from "app/core/layouts/Layout"
import RfpForm from "app/rfp/components/form/form"

const RfpNew: BlitzPage = () => {
  const queryParams = useRouterQuery()

  return (
    <Layout title="New Proposal">
      <RfpForm />
    </Layout>
  )
}

RfpNew.suppressFirstRenderFlicker = true

export default RfpNew
