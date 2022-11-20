import { useRouter } from "next/router"
import { useQuery, useMutation, invalidateQuery } from "@blitzjs/rpc"
import { BlitzPage, useParam, Routes } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import getRfpById from "app/rfp/queries/getRfpById"
import { RfpSidebar } from "app/rfp/components/RfpSidebar"
import { RfpNavigator } from "app/rfp/components/RfpNavigator"
import { useUserIsWorkspaceOrSigner } from "app/core/hooks/useUserIsWorkspaceOrSigner"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { RfpStatus } from "@prisma/client"
import updateRfpStatus from "app/rfp/mutations/updateRfpStatus"
import useStore from "app/core/hooks/useStore"
import { RfpDetailsForm } from "app/rfp/components/RfpDetailsForm"
import { RfpPermissionsForm } from "app/rfp/components/RfpPermissionsForm"
import { RfpStatusForm } from "app/rfp/components/RfpStatusForm"

const RfpSettings: BlitzPage = () => {
  const rfpId = useParam("rfpId", "string") as string
  const router = useRouter()

  const [rfp] = useQuery(
    getRfpById,
    {
      id: rfpId,
    },
    { enabled: !!rfpId, suspense: false, refetchOnWindowFocus: false }
  )

  const { userIsWorkspace, userIsWorkspaceSigner } = useUserIsWorkspaceOrSigner({
    account: rfp?.account,
  })

  const NoAccessView = () => (
    <div className="flex flex-col justify-center text-center align-middle h-full w-full">
      <div>
        <p>You do not have access to this page.</p>
        <Button
          className="mt-10 max-w-fit"
          onClick={() => router.push(Routes.RfpDetail({ rfpId }))}
        >
          View proposals for this RFP
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* LEFT SIDEBAR | PROPOSALS */}
      <div className="flex flex-row h-full">
        <RfpSidebar rfp={rfp} />
        <div className="px-10 flex-1 max-h-screen overflow-y-auto">
          {userIsWorkspace || userIsWorkspaceSigner ? (
            <>
              <RfpNavigator />
              <div className="mt-8 lg:w-3/5 w-full">
                <RfpDetailsForm rfp={rfp} />
                <div className="mt-8 border-t border-t-concrete">
                  <RfpStatusForm rfp={rfp} />
                </div>
                <div className="mt-8 border-t border-t-concrete">
                  <RfpPermissionsForm rfp={rfp} />
                </div>
              </div>
            </>
          ) : (
            <NoAccessView />
          )}
        </div>
      </div>
    </>
  )
}

RfpSettings.suppressFirstRenderFlicker = true
RfpSettings.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return <Layout title="RFP settings">{page}</Layout>
}
export default RfpSettings
