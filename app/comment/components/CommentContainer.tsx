import { useMutation } from "@blitzjs/rpc"
import useStore from "app/core/hooks/useStore"
import Avatar from "app/core/components/sds/images/avatar"
import { Form, Field } from "react-final-form"
import createComment from "app/comment/mutations/createComment"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"

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
      <div className="flex flex-row items-center space-x-2">
        <Avatar address={comment.author.address as string} pfpUrl={comment.author.pfpUrl} />
        <span className="text-marble-white">{comment.author.data?.name}</span>
        <span className="text-concrete">{comment.author.address}</span>
      </div>
      <span>{comment.data.message}</span>
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
            parentId: comment.id,
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
                type={ButtonType.Secondary}
                onClick={async (e) => {
                  e.preventDefault()
                  await handleSubmit()
                }}
              >
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
