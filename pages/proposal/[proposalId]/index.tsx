import { gSSP } from "app/blitz-server"
import { useQuery, useMutation, invoke } from "@blitzjs/rpc"
import { BlitzPage, useParam } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import getProposalById from "app/proposal/queries/getProposalById"
import ReadMore from "app/core/components/ReadMore"
import { TotalPaymentView } from "app/core/components/TotalPaymentView"
import RoleSignaturesView from "app/core/components/RoleSignaturesView"
import { Proposal } from "app/proposal/types"
import { ProposalNestedLayout } from "app/core/components/ProposalNestedLayout"
import CommentContainer from "app/comment/components/CommentContainer"
import Button from "app/core/components/sds/buttons/Button"
import Avatar from "app/core/components/sds/images/avatar"
import useStore from "app/core/hooks/useStore"
import { Form, Field } from "react-final-form"
import createComment from "app/comment/mutations/createComment"

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
  const [createCommentMutation] = useMutation(createComment, {
    onSuccess: (_data) => {},
    onError: (error) => {
      console.error(error)
    },
  })

  return (
    <>
      <ReadMore className="mt-9 mb-9">{proposal?.data?.content?.body}</ReadMore>
      <RoleSignaturesView proposal={proposal as Proposal} className="mt-9" />
      {(proposal?.data.totalPayments || []).length > 0 && (
        <TotalPaymentView proposal={proposal!} className="mt-9" />
      )}
      {proposal?.comments && proposal.comments.length === 0 && (
        <>
          <div className="flex flex-col items-center mt-12">
            <span className="font-bold mb-2 text-lg">
              There are no comments on this proposal yet!
            </span>
            <Button>Start a conversation</Button>
          </div>
          <div>
            <div className="flex flex-row items-center mb-2 space-x-2">
              <Avatar address={activeUser?.address as string} pfpUrl={activeUser?.data?.pfpUrl} />
              <span className="text-marble-white">{activeUser?.data?.name}</span>
              <span className="text-concrete">{activeUser?.address}</span>
            </div>
            <Form
              onSubmit={async (values: any) => {
                if (!activeUser) {
                  // add toast?
                  console.error("Need to be logged in to comment")
                  return
                }
                createCommentMutation({
                  commentBody: values.commentBody,
                  proposalId: proposal.id,
                  authorId: activeUser.id,
                })
              }}
              render={({ handleSubmit }) => {
                return (
                  <form onSubmit={handleSubmit} className="w-full flex flex-row space-x-2">
                    <Field
                      name="commentBody"
                      component="input"
                      className="w-full bg-wet-concrete rounded"
                    />
                    <Button
                      onClick={async (e) => {
                        e.preventDefault()
                        await handleSubmit()
                      }}
                    >
                      Send
                    </Button>
                  </form>
                )
              }}
            />
          </div>
        </>
      )}
      {proposal?.comments &&
        proposal.comments.map((comment) => (
          <CommentContainer key={comment.id} comment={comment} proposal={proposal} />
        ))}
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
