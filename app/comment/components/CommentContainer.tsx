import { useMutation, invalidateQuery } from "@blitzjs/rpc"
import useStore from "app/core/hooks/useStore"
import { Form, Field } from "react-final-form"
import createComment from "app/comment/mutations/createComment"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import AccountMediaRow from "./AccountMediaRow"
import getProposalById from "app/proposal/queries/getProposalById"

const CommentContainer = ({ proposal, comment }) => {
  console.log(comment)
  const activeUser = useStore((state) => state.activeUser)
  const [createCommentMutation] = useMutation(createComment, {
    onSuccess: (_data) => {},
    onError: (error) => {
      console.error(error)
    },
  })

  return (
    <div className="mt-12 border rounded-lg border-wet-concrete p-4 flex flex-col space-y-4">
      <AccountMediaRow comment={comment} />
      <span>{comment.data.message}</span>
      {comment.children.map((child) => {
        return (
          <>
            <AccountMediaRow comment={child} />
            <span>{child.data.message}</span>
          </>
        )
      })}
      <Form
        onSubmit={async (values: any, form) => {
          if (!activeUser) {
            // add toast?
            console.error("Need to be logged in to comment")
            return
          }
          await createCommentMutation({
            commentBody: values.commentBody,
            proposalId: proposal.id,
            authorId: activeUser.id,
            parentId: comment.id,
          })

          invalidateQuery(getProposalById)
          form.restart()
        }}
        render={({ handleSubmit }) => {
          return (
            <form onSubmit={handleSubmit} className="w-full flex flex-row space-x-2">
              <Field
                name="commentBody"
                component="input"
                placeholder="leave a reply"
                className="w-full bg-wet-concrete rounded px-2"
              />
              <Button type={ButtonType.Secondary} isSubmitType={true}>
                Reply
              </Button>
            </form>
          )
        }}
      />
    </div>
  )
}

export default CommentContainer
