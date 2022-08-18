import {
  BlitzPage,
  GetServerSideProps,
  InferGetServerSidePropsType,
  invoke,
  Routes,
  useParam,
  useQuery,
} from "blitz"
import getRfpById from "app/rfp/queries/getRfpById"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import Layout from "app/core/layouts/Layout"
import { ProposalMarkdownForm } from "app/proposal/components/ProposalMarkdownForm"
import getProposalById from "app/proposal/queries/getProposalById"

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { terminalHandle, rfpId, proposalId } = context.query as {
    terminalHandle: string
    rfpId: string
    proposalId: string
  }
  const rfp = await invoke(getRfpById, { id: rfpId })
  if (!rfp) {
    return {
      notFound: true,
    }
  }
  const terminal = await invoke(getTerminalByHandle, { handle: terminalHandle })

  if (!terminal) {
    return {
      notFound: true,
    }
  }
  const proposal = await invoke(getProposalById, { id: proposalId })

  if (!proposal) {
    return {
      notFound: true,
    }
  }

  if (proposal.approvals?.length) {
    return {
      redirect: {
        destination: Routes.ProposalPage({ terminalHandle, rfpId, proposalId }),
        permanent: false,
      },
    }
  }

  return {
    props: { rfp, terminal, proposal },
  }
}

const EditProposalPage: BlitzPage = ({
  rfp,
  terminal,
  proposal,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
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
