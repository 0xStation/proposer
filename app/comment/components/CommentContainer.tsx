import { useState } from "react"
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
  const [isExpanded, setIsExpanded] = useState(false)

  if (!canRead) {
    return <></>
  }

  const CommentElement = ({ comment }) => {
    return (
      <div>
        <div className="flex flex-row items-start space-x-2">
          <AccountMediaRow account={comment.author} />
          <span className="text-light-concrete text-sm">{timeSince(comment.createdAt)}</span>
        </div>
        <span className="ml-8 block">{comment.data.body}</span>
      </div>
    )
  }

  return (
    <div className="border rounded-lg border-wet-concrete p-6 md:p-4 flex flex-col space-y-6">
      <CommentElement comment={comment} />
      {!isExpanded && comment.children.length > 0 && (
        <div>
          {comment.children.length > 1 && (
            <span
              className="bg-wet-concrete px-4 py-2 rounded-full cursor-pointer inline-block mb-6"
              onClick={() => setIsExpanded(true)}
            >
              Show {comment.children.length - 1} more replies
            </span>
          )}
          <CommentElement comment={comment.children[comment.children.length - 1]} />
        </div>
      )}

      {isExpanded &&
        comment.children.map((child, idx) => {
          return <CommentElement comment={child} key={idx} />
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
            try {
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
            } catch (error) {
              setToastState({
                isToastShowing: true,
                type: "error",
                message: error.message,
              })
              return
            }
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
