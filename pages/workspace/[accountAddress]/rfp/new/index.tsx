import { BlitzPage } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import RfpForm from "app/rfp/components/form/form"
import { useRouter } from "next/router"

const RfpNew: BlitzPage = () => {
  return (
    <Layout title="New RFP">
      <RfpForm />
    </Layout>
  )
}

RfpNew.suppressFirstRenderFlicker = true

export default RfpNew
