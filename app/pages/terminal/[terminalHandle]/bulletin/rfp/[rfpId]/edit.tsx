import { BlitzPage, useQuery, useParam } from "blitz"
import Layout from "app/core/layouts/Layout"
import getCheckbooksByTerminal from "app/checkbook/queries/getCheckbooksByTerminal"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import RfpMarkdownForm from "app/rfp/components/RfpMarkdownForm"
import getRfpById from "app/rfp/queries/getRfpById"
import { Terminal } from "app/terminal/types"
import { Rfp } from "app/rfp/types"
import { Checkbook } from "app/checkbook/types"

const EditRfpPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const rfpId = useParam("rfpId") as string
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle },
    { suspense: false, enabled: !!terminalHandle }
  )

  const [checkbooks] = useQuery(
    getCheckbooksByTerminal,
    { terminalId: terminal?.id as number },
    { suspense: false, enabled: !!terminal }
  )

  const [rfp] = useQuery(getRfpById, { id: rfpId }, { suspense: false, enabled: !!rfpId })

  return (
    <Layout title="Edit RFP">
      <RfpMarkdownForm
        checkbooks={checkbooks as unknown as Checkbook[]}
        terminal={terminal as Terminal}
        isEdit={true}
        rfp={rfp as Rfp}
      />
    </Layout>
  )
}

EditRfpPage.suppressFirstRenderFlicker = true
export default EditRfpPage
