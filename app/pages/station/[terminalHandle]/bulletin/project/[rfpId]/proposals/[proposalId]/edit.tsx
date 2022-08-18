import {
  BlitzPage,
  GetServerSideProps,
  InferGetServerSidePropsType,
  invoke,
  useParam,
  useQuery,
} from "blitz"
import getRfpById from "app/rfp/queries/getRfpById"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import Layout from "app/core/layouts/Layout"
import { ProposalMarkdownForm } from "app/proposal/components/ProposalMarkdownForm"
import getProposalById from "app/proposal/queries/getProposalById"

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { terminalHandle, rfpId } = context.query as { terminalHandle: string; rfpId: string }
  const rfp = await invoke(getRfpById, { id: rfpId })
  const terminal = await invoke(getTerminalByHandle, { handle: terminalHandle })

  if (!rfp || !terminal) {
    return {
      notFound: true,
    }
  }

  return {
    props: { rfp, terminal },
  }
}

const EditProposalPage: BlitzPage = ({
  rfp,
  terminal,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const proposalId = useParam("proposalId")
  const [proposal] = useQuery(
    getProposalById,
    { id: proposalId as string },
    { suspense: false, enabled: !!proposalId }
  )

  return (
    <Layout title="Edit Proposal">
      <ProposalMarkdownForm
        rfp={rfp}
        terminal={terminal}
        proposal={proposal || undefined}
        isEdit={true}
      />
    </Layout>
  )
}

EditProposalPage.suppressFirstRenderFlicker = true
export default EditProposalPage
