import {
  BlitzPage,
  useParam,
  useQuery,
  Routes,
  useRouter,
  useMutation,
  invalidateQuery,
} from "blitz"
import Layout from "app/core/layouts/Layout"
import getRfpById from "app/rfp/queries/getRfpById"
import getProposalsByRfpId from "app/proposal/queries/getProposalsByRfpId"
import { RfpSidebar } from "app/rfp/components/RfpSidebar"
import { RfpNavigator } from "app/rfp/components/RfpNavigator"
import { useUserIsWorkspaceOrSigner } from "app/core/hooks/useUserIsWorkspaceOrSigner"
import Button from "../../../core/components/sds/buttons/Button"
import { RfpStatus } from "@prisma/client"
import updateRfpStatus from "app/rfp/mutations/updateRfpStatus"
import useStore from "app/core/hooks/useStore"

const RfpSettings: BlitzPage = () => {
  const rfpId = useParam("rfpId", "string") as string
  const router = useRouter()
  const setToastState = useStore((state) => state.setToastState)

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

  const [updateRfpStatusMutation] = useMutation(updateRfpStatus, {
    onSuccess: (data) => {},
    onError: (error) => {
      console.error(error)
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Workspace successfully updated",
      })
    },
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
    <Layout>
      {/* LEFT SIDEBAR | PROPOSALS */}
      <div className="flex flex-row h-full">
        <RfpSidebar rfp={rfp} />
        <div className="px-10 flex-1 max-h-screen overflow-y-auto">
          {userIsWorkspace || userIsWorkspaceSigner ? (
            <>
              <RfpNavigator />
              <div className="mt-8 w-1/2">
                <h1>Current status</h1>
                <div className="flex flex-row mt-3 items-center justify-between">
                  <p>Open for submission</p>
                  {rfp?.status === RfpStatus.OPEN ? (
                    <Button
                      onClick={async () => {
                        try {
                          const updatedStatus = await updateRfpStatusMutation({
                            rfpId: rfp?.id as string,
                            status: RfpStatus.CLOSED,
                          })
                          if (updatedStatus) {
                            setToastState({
                              isToastShowing: true,
                              type: "success",
                              message: "Successfully closed RFP.",
                            })
                          }
                          invalidateQuery(getRfpById)
                        } catch (err) {
                          setToastState({
                            isToastShowing: true,
                            type: "error",
                            message: "Error closing RFP.",
                          })
                        }
                      }}
                    >
                      Close this RFP
                    </Button>
                  ) : (
                    <Button
                      onClick={async () => {
                        try {
                          const updatedStatus = await updateRfpStatusMutation({
                            rfpId: rfp?.id as string,
                            status: RfpStatus.OPEN,
                          })
                          if (updatedStatus) {
                            setToastState({
                              isToastShowing: true,
                              type: "success",
                              message: "Successfully opened RFP.",
                            })
                          }
                          invalidateQuery(getRfpById)
                        } catch (err) {
                          setToastState({
                            isToastShowing: true,
                            type: "error",
                            message: "Error opening RFP.",
                          })
                        }
                      }}
                    >
                      Open this RFP
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <NoAccessView />
          )}
        </div>
      </div>
    </Layout>
  )
}

RfpSettings.suppressFirstRenderFlicker = true
export default RfpSettings
