import { gSSP } from "app/blitz-server"
import { Routes } from "@blitzjs/next"
import { useQuery, invoke } from "@blitzjs/rpc"
import { BlitzPage, useParam } from "@blitzjs/next"
import { PencilIcon } from "@heroicons/react/solid"
import { ProposalRoleType, ProposalStatus } from "@prisma/client"
import Layout from "app/core/layouts/Layout"
import getProposalById from "app/proposal/queries/getProposalById"
import ReadMore from "app/core/components/ReadMore"
import { TotalPaymentView } from "app/core/components/TotalPaymentView"
import RoleSignaturesView from "app/core/components/RoleSignaturesView"
import { Proposal } from "app/proposal/types"
import { ProposalNestedLayout } from "app/core/layouts/ProposalNestedLayout"
import useStore from "app/core/hooks/useStore"
import useGetUsersRoles from "app/core/hooks/useGetUsersRoles"
import CommentContainer from "app/comment/components/CommentContainer"
import NewCommentThread from "app/comment/components/NewCommentThread"
import CommentEmptyState from "app/comment/components/CommentEmptyState"
import useCommentPermissions from "app/core/hooks/useCommentPermissions"
import { useRouter } from "next/router"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"

export const ToolTip = ({ children }) => {
  return (
    <div className="hidden bg-wet-concrete invisible group-hover:visible md:inline rounded p-2 mr-1.5">
      {children}
    </div>
  )
}

export const EditIcon = ({ disabled = false, children }) => {
  const disabledStyling = disabled ? "text-concrete" : "text-marble-white"
  return (
    <div className="inline mt-5 w-full cursor-pointer align-middle">
      <PencilIcon className={`h-5 w-5 inline ${disabledStyling}`} />
      <p className={`inline ml-2 ${disabledStyling}`}>{children}</p>
    </div>
  )
}

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

const ViewProposal: BlitzPage = () => {
  const proposalId = useParam("proposalId") as string
  const [proposal, { setQueryData: setProposalQueryData }] = useQuery(
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
  const { roles: activeUsersRoles } = useGetUsersRoles(proposalId)
  const router = useRouter()

  const { canRead, canWrite } = useCommentPermissions(proposal?.id)

  return (
    <>
      {activeUserIsAuthor ? (
        proposal?.status === ProposalStatus.DRAFT ||
        proposal?.status === ProposalStatus.AWAITING_APPROVAL ? (
          <div className="relative group float-right mt-5 mr-2 md:mr-0">
            <ToolTip>Only you as the author can edit your proposal.</ToolTip>
            <button
              onClick={() => {
                router.push(Routes.EditProposalPage({ proposalId }))
              }}
            >
              <EditIcon>Edit Proposal</EditIcon>
            </button>
          </div>
        ) : (
          <div className="relative group float-right mt-5 mr-2 md:mr-0">
            <ToolTip>You can only edit the proposal before approval.</ToolTip>
            <EditIcon disabled={true}>Edit Proposal</EditIcon>
          </div>
        )
      ) : (
        activeUsersRoles?.length > 0 && (
          <div className="relative group float-right mt-5 mr-2 md:mr-0">
            <ToolTip>Currently, only the author can edit the proposal.</ToolTip>
            <EditIcon disabled={true}>Edit Proposal</EditIcon>
          </div>
        )
      )}
      <ReadMore className="mt-12 mb-9 mx-6 md:mx-0">{proposal?.data?.content?.body}</ReadMore>
      <RoleSignaturesView proposal={proposal as Proposal} className="mt-9" />
      {(proposal?.data.totalPayments || []).length > 0 && (
        <TotalPaymentView proposal={proposal!} className="mt-9" />
      )}
      {canRead && (
        <h3 className="text-concrete text-xs uppercase font-bold mb-2 mt-12 mx-6 md:mx-0">
          Comments
        </h3>
      )}
      {proposal?.comments && proposal.comments.length === 0 ? (
        <CommentEmptyState proposal={proposal} setProposalQueryData={setProposalQueryData} />
      ) : (
        <div className="space-y-6">
          {proposal?.comments &&
            proposal.comments.map((comment, idx) => (
              <CommentContainer
                key={`comment-${idx}`}
                comment={comment}
                proposal={proposal}
                setProposalQueryData={setProposalQueryData}
              />
            ))}
          <NewCommentThread proposal={proposal} setProposalQueryData={setProposalQueryData} />
        </div>
      )}
    </>
  )
}

ViewProposal.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return (
    <Layout title="View Proposal">
      <ProposalNestedLayout status={page.props.status}>{page}</ProposalNestedLayout>
    </Layout>
  )
}

ViewProposal.suppressFirstRenderFlicker = true

export default ViewProposal
