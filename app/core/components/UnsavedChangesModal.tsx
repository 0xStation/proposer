import { useState, useEffect } from "react"
import Modal from "./Modal"
import useWarnIfUnsavedChanges from "app/core/hooks/useWarnIfUnsavedChanges"

// this isn't working, but I want to leave it here so we can get some discussion going
const UnsavedChangesModal = ({ hasChanges }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [status, setStatus] = useState<boolean>(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>()

  function asyncTimeout(callback, ms) {
    return new Promise((resolve) =>
      setTimeoutId(
        setTimeout(() => {
          callback()
          resolve
        }, ms)
      )
    )
  }

  useEffect(() => {
    if (status && timeoutId) {
      clearTimeout(timeoutId)
      setIsOpen(false)
    }
  }, [status])

  // useWarnIfUnsavedChanges(hasChanges, async () => {
  //   setIsOpen(true)
  //   await asyncTimeout(() => {
  //     setIsOpen(false)
  //   }, 5000)
  //   return status
  // })

  return (
    <Modal title="unsaved changes" open={isOpen} toggle={setIsOpen}>
      <button
        onClick={() => {
          setStatus(true)
        }}
      >
        Confirm
      </button>
      <button
        onClick={() => {
          setStatus(false)
        }}
      >
        Deny
      </button>
    </Modal>
  )
}

export default UnsavedChangesModal
