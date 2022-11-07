import { gSSP } from "app/blitz-server"
import { Routes } from "@blitzjs/next"
import { useQuery, invoke } from "@blitzjs/rpc"
import { BlitzPage, useParam } from "@blitzjs/next"
import Link from "next/link"
import { PencilIcon } from "@heroicons/react/solid"
import Layout from "app/core/layouts/Layout"
import getProposalById from "app/proposal/queries/getProposalById"
import ReadMore from "app/core/components/ReadMore"
import { TotalPaymentView } from "app/core/components/TotalPaymentView"
import RoleSignaturesView from "app/core/components/RoleSignaturesView"
import { Proposal } from "app/proposal/types"
import { ProposalNestedLayout } from "app/core/components/ProposalNestedLayout"
import { ProposalRoleType } from "@prisma/client"
import useStore from "app/core/hooks/useStore"

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
    props: {}, // will be passed to the page component as props
  }
})

const ViewProposal: BlitzPage = () => {
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
  const activeUser = useStore((state) => state.activeUser)
  const activeUserIsAuthor = proposal?.roles?.find(
    (role) => role.type === ProposalRoleType.AUTHOR && role.address === activeUser?.address
  )

  return (
    <>
      {activeUserIsAuthor && (
        <div className="relative group float-right mt-5">
          <div className="bg-wet-concrete invisible group-hover:visible inline rounded p-2 mr-1.5">
            You can edit your proposal here.
          </div>
          <Link href={Routes.EditProposalPage({ proposalId })}>
            <div className="inline mt-5 w-full cursor-pointer align-middle">
              <PencilIcon className="h-5 w-5 inline" />
              <p className="inline ml-2">Edit proposal</p>
            </div>
          </Link>
        </div>
      )}
      <ReadMore className="mt-12 mb-9">{proposal?.data?.content?.body}</ReadMore>
      <RoleSignaturesView proposal={proposal as Proposal} className="mt-9" />
      {(proposal?.data.totalPayments || []).length > 0 && (
        <TotalPaymentView proposal={proposal!} className="mt-9" />
      )}
    </>
  )
}

ViewProposal.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return (
    <Layout title="View Proposal">
      <ProposalNestedLayout>{page}</ProposalNestedLayout>
    </Layout>
  )
}

ViewProposal.suppressFirstRenderFlicker = true

export default ViewProposal
