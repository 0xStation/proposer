import { useMutation } from "@blitzjs/rpc"
import useStore from "app/core/hooks/useStore"
import { Form, Field } from "react-final-form"
import createComment from "app/comment/mutations/createComment"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import AccountMediaRow from "./AccountMediaRow"
import timeSince from "app/core/utils/timeSince"
import useCommentPermissions from "app/core/hooks/useCommentPermissions"

const CommentContainer = ({ proposal, comment, setProposalQueryData }) => {
  const { canRead, canWrite } = useCommentPermissions(proposal?.id)
  const setToastState = useStore((state) => state.setToastState)
  const activeUser = useStore((state) => state.activeUser)
  const [createCommentMutation] = useMutation(createComment)

  if (!canRead) {
    return <></>
  }

  return (
    <div className="border rounded-lg border-wet-concrete p-4 flex flex-col space-y-6">
      <div>
        <div className="flex flex-row items-center space-x-2">
          <AccountMediaRow account={comment.author} />
          <span className="text-light-concrete text-sm">{timeSince(comment.createdAt)}</span>
        </div>
        <span className="mt-2 block">{comment.data.body}</span>
      </div>
      {comment.children.map((child, idx) => {
        return (
          <div key={idx}>
            <div className="flex flex-row items-center space-x-2">
              <AccountMediaRow account={child.author} />
              <span className="text-light-concrete text-sm">{timeSince(child.createdAt)}</span>
            </div>
            <span className="mt-2 block">{child.data.body}</span>
          </div>
        )
      })}
      {canWrite && (
        <Form
          onSubmit={async (values: any, form) => {
            if (!activeUser) {
              setToastState({
                isToastShowing: true,
                type: "error",
                message: "You must be logged in to comment",
              })
              return
            }
            await createCommentMutation({
              commentBody: values.commentBody,
              proposalId: proposal.id,
              parentId: comment.id,
            })
            const proposalWithNewReply = {
              ...proposal,
              comments: proposal.comments.map((mapComment) => {
                if (mapComment.id === comment.id) {
                  return {
                    ...comment,
                    children: [
                      ...comment.children,
                      {
                        // don't need id for optomistic update, and we don't have it anyways
                        createdAt: new Date(),
                        data: {
                          body: values.commentBody,
                        },
                        author: {
                          address: activeUser.address,
                        },
                      },
                    ],
                  }
                } else {
                  return mapComment
                }
              }),
            }
            setProposalQueryData(proposalWithNewReply)
            form.restart()
          }}
          render={({ handleSubmit }) => {
            return (
              <form onSubmit={handleSubmit} className="w-full flex flex-row space-x-2">
                <Field
                  name="commentBody"
                  component="input"
                  placeholder="Leave a reply"
                  className="w-full bg-wet-concrete rounded px-2"
                />
                <Button type={ButtonType.Secondary} isSubmitType={true}>
                  Reply
                </Button>
              </form>
            )
          }}
        />
      )}
    </div>
  )
}

export default CommentContainer
