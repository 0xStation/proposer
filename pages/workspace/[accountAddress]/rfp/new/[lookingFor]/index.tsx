import { BlitzPage } from "@blitzjs/next"
import BackButtonLayout from "app/core/layouts/BackButtonLayout"
import Layout from "app/core/layouts/Layout"
import RfpForm from "app/rfp/components/form/form"

const RfpNew: BlitzPage = () => {
  return <RfpForm />
}

RfpNew.suppressFirstRenderFlicker = true
RfpNew.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return (
    <Layout title="New RFP">
      <BackButtonLayout>{page}</BackButtonLayout>
    </Layout>
  )
}

export default RfpNew
