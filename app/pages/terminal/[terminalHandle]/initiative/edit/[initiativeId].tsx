import { BlitzPage, useQuery, useParam, useRouter, Image, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import useStore from "app/core/hooks/useStore"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import getInitiativeByLocalId from "app/initiative/queries/getInitiativeByLocalId"
import { canEdit } from "app/core/utils/permissions"
import { EditPermissionTypes } from "app/core/utils/constants"
import Exit from "public/exit-button.svg"
import InitiativeForm from "app/initiative/components/InitiativeForm"

const TerminalInitiativeEditPage: BlitzPage = () => {
  const router = useRouter()
  const terminalHandle = useParam("terminalHandle", "string") as string
  const initiativeLocalId = useParam("initiativeId", "number") as number
  const activeUser = useStore((state) => state.activeUser)
  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })
  const [initiative] = useQuery(
    getInitiativeByLocalId,
    {
      terminalId: terminal?.id,
      localId: initiativeLocalId,
    },
    { suspense: false, enabled: !!terminal?.id }
  )
  const userCanEdit = activeUser
    ? canEdit(activeUser, terminal?.id, EditPermissionTypes.INITIATIVE)
    : false

  // todo: better error for unauthed users
  return (
    <Layout title={`${terminal?.data?.name ? terminal?.data?.name + " | " : ""}Edit Initiative`}>
      {!userCanEdit ? (
        <div>You do not have access to this page.</div>
      ) : (
        <div className="bg-tunnel-black min-h-[calc(100vh-15rem)] h-[1px] relative">
          <div className="absolute top-3 left-5">
            <div className="w-[24px] h-[24px]">
              <button
                className="text-marble-white"
                onClick={() => router.push(Routes.TerminalInitiativePage({ terminalHandle }))}
              >
                <Image src={Exit} alt="Close button" width={24} height={24} />
              </button>
            </div>
          </div>
          <h1 className="text-marble-white text-4xl text-center pt-12">Edit Initiative</h1>
          <div className="mx-auto max-w-2xl pb-12">
            <InitiativeForm
              initiative={initiative}
              isEdit={true}
              onSuccess={() => {
                router.push(Routes.TerminalInitiativePage({ terminalHandle }))
              }}
            />
          </div>
        </div>
      )}
    </Layout>
  )
}

TerminalInitiativeEditPage.suppressFirstRenderFlicker = true

export default TerminalInitiativeEditPage
