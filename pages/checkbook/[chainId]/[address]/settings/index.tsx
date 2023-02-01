import { BlitzPage } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import CheckbookSidebar from "app/checkbook/components/CheckbookSidebar"
import { SignatureThresholdBox } from "app/checkbook/components/SignatureThresholdBox"
import { ChangeSignersBox } from "app/checkbook/components/ChangeSignersBox"

const SettingsHome: BlitzPage = () => {
  return (
    <div>
      <SignatureThresholdBox />
      <ChangeSignersBox className="mt-6" />
    </div>
  )
}

SettingsHome.suppressFirstRenderFlicker = true
SettingsHome.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return (
    <Layout title="Checkbook">
      <div className="flex flex-col md:flex-row h-full">
        <CheckbookSidebar />
        <div className="p-5 md:p-10 w-full max-h-screen overflow-y-auto">{page}</div>
      </div>
    </Layout>
  )
}
export default SettingsHome
