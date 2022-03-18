import { BlitzPage, useQuery, useParam } from "blitz"
import Layout from "app/core/layouts/Layout"
import useStore from "app/core/hooks/useStore"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import { canEdit } from "app/core/utils/permissions"

const TerminalInitiativeEditPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle", "string") as string
  const activeUser = useStore((state) => state.activeUser)
  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })
  const userCanEdit = activeUser ? canEdit(activeUser, terminal?.id) : false

  // todo: better error for unauthed users
  return (
    <Layout title={`${terminal?.data?.name ? terminal?.data?.name + " | " : ""}Edit Initiative`}>
      {!userCanEdit ? <div>You do not have access to this page.</div> : <div>editing</div>}
    </Layout>
  )
}

TerminalInitiativeEditPage.suppressFirstRenderFlicker = true

export default TerminalInitiativeEditPage
