import { BlitzPage, useQuery, useParam } from "blitz"
import Layout from "app/core/layouts/Layout"
import useStore from "app/core/hooks/useStore"
import getCheckbooksByTerminal from "app/checkbook/queries/getCheckbooksByTerminal"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import RfpMarkdownForm from "app/rfp/components/RfpMarkdownForm"
import { Checkbook } from "app/checkbook/types"

const CreateRFPPage: BlitzPage = () => {
  const activeUser = useStore((state) => state.activeUser)

  const terminalHandle = useParam("terminalHandle") as string
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle },
    { suspense: false, enabled: !!terminalHandle, refetchOnWindowFocus: false }
  )

  const [checkbooks] = useQuery(
    getCheckbooksByTerminal,
    { terminalId: terminal?.id || 0 },
    { suspense: false, enabled: !!terminal, refetchOnWindowFocus: false }
  )

  // redirect?
  if (!terminal || !activeUser) {
    return <Layout title={`New RFP`}></Layout>
  }

  return (
    <Layout title={`New RFP`}>
      <RfpMarkdownForm
        checkbooks={checkbooks as unknown as Checkbook[]}
        terminal={terminal}
        isEdit={false}
      />
    </Layout>
  )
}

CreateRFPPage.suppressFirstRenderFlicker = true
export default CreateRFPPage
