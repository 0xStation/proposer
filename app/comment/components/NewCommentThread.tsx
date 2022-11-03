import { useState } from "react"
import { Transition } from "@headlessui/react"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import NewCommentThreadForm from "app/comment/components/NewCommentThreadForm"

const NewCommentThread = ({ proposal }) => {
  const [showNewThread, setShowNewThread] = useState(false)
  return (
    <div className="mt-4 h-[100px]">
      {!showNewThread && (
        <Button
          type={ButtonType.Unemphasized}
          className="mx-auto block"
          onClick={() => setShowNewThread(true)}
        >
          Start a new thread
        </Button>
      )}
      <Transition
        show={showNewThread}
        enter="transform transition ease-in-out duration-500 sm:duration-700"
        enterFrom="translate-y-full"
        enterTo="translate-y-0"
        leave="transform transition ease-in-out duration-500 sm:duration-700"
        leaveFrom="translate-y-0"
        leaveTo="translate-y-full"
      >
        <div className="rounded-lg border border-wet-concrete p-4">
          <NewCommentThreadForm proposal={proposal} cleanup={() => setShowNewThread(false)} />
        </div>
      </Transition>
    </div>
  )
}

export default NewCommentThread
