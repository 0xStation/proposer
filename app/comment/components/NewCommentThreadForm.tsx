import { useMutation, invalidateQuery } from "@blitzjs/rpc"
import useStore from "app/core/hooks/useStore"
import createComment from "app/comment/mutations/createComment"
import { Form, Field } from "react-final-form"
import Button from "app/core/components/sds/buttons/Button"
import getProposalById from "app/proposal/queries/getProposalById"

const NewCommentThreadForm = ({ proposal, cleanup, setProposalQueryData }) => {
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const [createCommentMutation] = useMutation(createComment)

  return (
    <div>
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
            authorId: activeUser.id,
          })

          const proposalWithNewComment = {
            ...proposal,
            comments: [
              ...proposal.comments,
              {
                // don't need id for optomistic update, and we don't have it anyways
                createdAt: new Date(),
                data: {
                  message: values.commentBody,
                },
                author: {
                  address: activeUser.address,
                },
                children: [],
              },
            ],
          }
          setProposalQueryData(proposalWithNewComment)
          form.restart()
          cleanup()
        }}
        render={({ handleSubmit }) => {
          return (
            <form onSubmit={handleSubmit} className="w-full flex flex-row space-x-2">
              <Field
                name="commentBody"
                component="input"
                placeholder="Write your comment here"
                className="w-full bg-wet-concrete rounded px-2"
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
  )
}

export default NewCommentThreadForm
