import { BlitzPage } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import RfpForm from "app/rfp/components/form/form"

const RfpNew: BlitzPage = () => {
  return <RfpForm />
}

RfpNew.suppressFirstRenderFlicker = true
RfpNew.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return <Layout title="New RFP">{page}</Layout>
}

export default RfpNew
