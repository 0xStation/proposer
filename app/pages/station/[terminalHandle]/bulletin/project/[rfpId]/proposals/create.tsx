import { BlitzPage, invoke, GetServerSideProps, InferGetServerSidePropsType } from "blitz"
// components
import Layout from "app/core/layouts/Layout"
// queries + mutations
import getRfpById from "app/rfp/queries/getRfpById"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
//types
import { Rfp } from "app/rfp/types"
import { Terminal } from "app/terminal/types"
import { ProposalMarkdownForm } from "app/proposal/components/ProposalMarkdownForm"

type GetServerSidePropsData = {
  rfp: Rfp
  terminal: Terminal
}

const CreateProposalPage: BlitzPage = ({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <Layout title="New Proposal">
      <ProposalMarkdownForm rfp={data.rfp} terminal={data.terminal} />
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { terminalHandle, rfpId } = context.query as { terminalHandle: string; rfpId: string }
  const rfp = await invoke(getRfpById, { id: rfpId })
  const terminal = await invoke(getTerminalByHandle, { handle: terminalHandle })

  if (!rfp || !terminal) {
    return {
      notFound: true,
    }
  }

  const data: GetServerSidePropsData = {
    rfp,
    terminal,
  }

  return {
    props: { data },
  }
}

CreateProposalPage.suppressFirstRenderFlicker = true
export default CreateProposalPage
