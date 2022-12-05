import { gSSP } from "app/blitz-server"
import { useQuery, invoke } from "@blitzjs/rpc"
import { useParam, BlitzPage } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import getProposalById from "app/proposal/queries/getProposalById"
import { ProposalNestedLayout } from "app/core/layouts/ProposalNestedLayout"
import getProposalVersionsByProposalId from "app/proposalVersion/queries/getProposalVersionsByProposalId"
import ProposalVersionBox from "app/core/components/ProposalVersionBox"

export const getServerSideProps = gSSP(async ({ params = {} }) => {
  const { proposalId } = params
  // regex checks if a string is a uuid
  // https://melvingeorge.me/blog/check-if-string-valid-uuid-regex-javascript
  const isUuidRegex =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi

  if (!proposalId || !isUuidRegex.test(proposalId as string)) {
    return {
      notFound: true,
    }
  }

  const proposal = await invoke(getProposalById, {
    id: proposalId,
  })

  if (!proposal) {
    return {
      notFound: true,
    }
  }

  return {
    props: { status: proposal.status }, // will be passed to the page component as props
  }
})

export const ProposalHistory: BlitzPage = () => {
  const proposalId = useParam("proposalId") as string
  const [proposal] = useQuery(
    getProposalById,
    { id: proposalId },
    {
      suspense: false,
      enabled: !!proposalId,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 60 * 1000, // 1 minute
    }
  )

  const [proposalVersions] = useQuery(
    getProposalVersionsByProposalId,
    { proposalId: proposalId },
    {
      suspense: false,
      enabled: !!proposal?.id,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 60 * 1000, // 1 minute
    }
  )

  return (
    <>
      {(proposalVersions || []).length > 1 ? (
        proposalVersions
          ?.filter(({ version }) => version !== 1)
          ?.map((proposalVersion, i) => (
            <ProposalVersionBox key={proposalVersion?.id} proposalVersion={proposalVersion} />
          ))
      ) : Boolean(proposal?.roles) ? (
        <div className="w-full h-full flex items-center flex-col sm:mt-0">
          <h1 className="text-2xl font-bold w-[295px] text-center mt-44">
            No changes have been made.
          </h1>
          <p className="text-base w-[320px] text-center mt-2.5">
            No updates have been made to this proposal yet.
          </p>
        </div>
      ) : (
        <div className="mt-9 h-[260px] w-full flex flex-row rounded-2xl bg-wet-concrete shadow border-solid motion-safe:animate-pulse" />
      )}
    </>
  )
}

ProposalHistory.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return (
    <Layout title="Proposal History">
      <ProposalNestedLayout status={page.props.status}>{page}</ProposalNestedLayout>
    </Layout>
  )
}

ProposalHistory.suppressFirstRenderFlicker = true
export default ProposalHistory
