import { useState } from "react"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import NewCommentThreadForm from "app/comment/components/NewCommentThreadForm"

const NewCommentThread = ({ proposal }) => {
  const [showNewThread, setShowNewThread] = useState(false)
  return (
    <div className="mt-4">
      {!showNewThread ? (
        <Button
          type={ButtonType.Unemphasized}
          className="mx-auto block"
          onClick={() => setShowNewThread(true)}
        >
          Start a new thread
        </Button>
      ) : (
        <div className="rounded-lg border border-wet-concrete p-4">
          <NewCommentThreadForm proposal={proposal} cleanup={() => setShowNewThread(false)} />
        </div>
      )}
    </div>
  )
}

export default NewCommentThread
