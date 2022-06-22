import {
  BlitzPage,
  Routes,
  useParam,
  Link,
  invoke,
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "blitz"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getRfpById from "app/rfp/queries/getRfpById"
import getProposalById from "app/proposal/queries/getProposalById"
import { Rfp } from "app/rfp/types"
import { Proposal } from "app/proposal/types"

type GetServerSidePropsData = {
  rfp: Rfp
  proposal: Proposal
}

const ProposalPage: BlitzPage = ({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const terminalHandle = useParam("terminalHandle") as string
  return (
    <Layout title={`Proposals`}>
      <TerminalNavigation>
        <div className="grid grid-cols-3 h-screen w-full box-border">
          <div className="col-span-2 p-6">
            <p className="self-center">
              <span className="text-concrete hover:text-light-concrete">
                <Link href={Routes.BulletinPage({ terminalHandle })}>Bulletin</Link> /&nbsp;
              </span>
              <span className="text-concrete hover:text-light-concrete">
                <Link href={Routes.RFPInfoTab({ terminalHandle, rfpId: data.rfp.id })}>
                  {`RFP: ${data.rfp?.data?.content?.title}`}
                </Link>
                /&nbsp;
              </span>
              {data.proposal.data.content.title}
            </p>
          </div>
          <div className="col-span-1 h-full border-l border-concrete p-6"></div>
        </div>
      </TerminalNavigation>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { terminalHandle, rfpId, proposalId } = context.query as {
    terminalHandle: string
    rfpId: string
    proposalId: string
  }
  const rfp = await invoke(getRfpById, { id: rfpId })
  const proposal = await invoke(getProposalById, { id: proposalId })

  if (!rfp || !proposal) {
    return {
      redirect: {
        destination: Routes.BulletinPage({ terminalHandle }),
        permanent: false,
      },
    }
  }

  const data: GetServerSidePropsData = {
    rfp,
    proposal,
  }

  return {
    props: { data },
  }
}

export default ProposalPage
