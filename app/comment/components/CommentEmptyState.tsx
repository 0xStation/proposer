import { useState } from "react"
import { Transition } from "@headlessui/react"
import Button from "app/core/components/sds/buttons/Button"
import NewCommentThreadForm from "app/comment/components/NewCommentThreadForm"
import useCommentPermissions from "app/core/hooks/useCommentPermissions"

const CommentEmptyState = ({ proposal, setProposalQueryData }) => {
  const { canRead, canWrite } = useCommentPermissions(proposal?.id)
  const [showNewThread, setShowNewThread] = useState(false)
  return (
    <div className="h-[300px]">
      {!showNewThread && canRead && (
        <div className="flex h-full flex-col items-center justify-center">
          <span className="font-bold mb-4 text-xl">
            There are no comments on this proposal yet!
          </span>
          {canWrite && <Button onClick={() => setShowNewThread(true)}>Start a conversation</Button>}
        </div>
      )}
      <Transition
        show={showNewThread}
        enter="transition-opacity duration-500 sm:duration-700"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-500 sm:duration-700"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="rounded-lg border border-wet-concrete p-4 mb-36">
          <NewCommentThreadForm
            proposal={proposal}
            startNewThread={() => setShowNewThread(false)}
            setProposalQueryData={setProposalQueryData}
          />
        </div>
      </Transition>
    </div>
  )
}

export default CommentEmptyState