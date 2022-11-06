import { useMutation } from "@blitzjs/rpc"
import useStore from "app/core/hooks/useStore"
import createComment from "app/comment/mutations/createComment"
import { Form, Field } from "react-final-form"
import Button from "app/core/components/sds/buttons/Button"

const NewCommentThreadForm = ({ proposal, startNewThread, setProposalQueryData }) => {
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
          // https://blitzjs.com/docs/mutation-usage#optimistic-updates
          // setting an optomistic update -- we can predict what the data will look like assuming a
          // successful mutation so that way we can immediately render the update without waiting
          // for the server to respond. once the server responds the data is updated appropriately.
          setProposalQueryData(proposalWithNewComment)
          // form.restart clears the input so a new comment can be entered.
          form.restart()
          // start new thread is a callback that is passed in from the parent component
          // designed to close the new thread component and reset the comment creation flow.
          startNewThread()
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
              <Button isSubmitType={true}>Send</Button>
            </form>
          )
        }}
      />
    </div>
  )
}

export default NewCommentThreadForm
