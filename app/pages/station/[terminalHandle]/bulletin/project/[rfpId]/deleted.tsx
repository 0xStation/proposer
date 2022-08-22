import {
  BlitzPage,
  GetServerSideProps,
  InferGetServerSidePropsType,
  invoke,
  Routes,
  useRouterQuery,
  useRouter,
} from "blitz"
import { RfpStatus } from "@prisma/client"
import Layout from "app/core/layouts/Layout"
import getRfpById from "app/rfp/queries/getRfpById"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { terminalHandle, rfpId } = context.query as {
    terminalHandle: string
    rfpId: string
    proposalId: string
  }
  const terminal = await invoke(getTerminalByHandle, { handle: terminalHandle })
  const rfp = await invoke(getRfpById, { id: rfpId })

  if (!rfp || !terminal) {
    return {
      redirect: {
        destination: Routes.BulletinPage({ terminalHandle }),
        permanent: false,
      },
    }
  }

  if (rfp.status !== RfpStatus.DELETED) {
    return {
      redirect: {
        destination: Routes.RFPInfoTab({ terminalHandle, rfpId: rfp?.id }),
        permanent: true,
      },
    }
  }

  return {
    props: { rfp, terminal },
  }
}

export const RfpDeletedPage: BlitzPage = ({
  rfp,
  terminal,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { proposalId } = useRouterQuery()
  const router = useRouter()

  return (
    <Layout title="Deleted RFP">
      <TerminalNavigation>
        <div className="w-full h-full flex items-center flex-col mt-20 sm:justify-center sm:mt-0">
          <h1 className="font-bold text-2xl">Project has been deleted.</h1>
          {proposalId && (
            <button
              onClick={() =>
                router.push(
                  Routes.ProposalPage({
                    terminalHandle: terminal?.handle,
                    rfpId: rfp?.id,
                    proposalId: proposalId as string,
                  })
                )
              }
              className="bg-electric-violet rounded text-tunnel-black h-[35px] px-4 mt-5 hover:opacity-70"
            >
              Go back to proposal
            </button>
          )}
        </div>
      </TerminalNavigation>
    </Layout>
  )
}

export default RfpDeletedPage
