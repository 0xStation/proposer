import Modal from "./Modal"
import { invoke } from "blitz"
import { useState, useEffect } from "react"
import { Button } from "./Button"
import createEndorsement from "app/endorsements/mutations/createEndorsement"
import useStore from "../hooks/useStore"

const EndorseModal = ({
  isEndorseModalOpen,
  setIsEndorseModalOpen,
  setIsSuccessModalOpen,
  selectedUserToEndorse: contributor,
  initiativeId,
  terminal,
  refetchApplications,
}) => {
  const activeUser = useStore((state) => state.activeUser)
  const setShouldRefetchEndorsementPoints = useStore(
    (state) => state.setShouldRefetchEndorsementPoints
  )
  const [endorsementMessage, setEndorsementMessage] = useState<string>("")
  const [error, setError] = useState<boolean>(false)

  const handleEndorseClick = async () => {
    const endorsement = await invoke(createEndorsement, {
      initiativeId: initiativeId,
      endorserId: activeUser?.id as number,
      endorseeId: contributor?.id,
      endorsementValue: 1,
    })
    if (!Object.keys(endorsement).length) {
      setError(true)
      setEndorsementMessage("Your endorsement didn't go through. Please try again.")
      return
    }
    setError(false)
    setEndorsementMessage("")
    setIsEndorseModalOpen(false)
    setShouldRefetchEndorsementPoints(true)
    refetchApplications()
    // allow time for applicant modal to clean up
    // before opening the next modal and causing
    // a memory leak + scroll lock
    // see https://github.com/tailwindlabs/headlessui/issues/825
    setTimeout(() => setIsSuccessModalOpen(true), 550)
  }

  return (
    <Modal
      title={`Endorse ${contributor?.data?.name}?`}
      subtitle={`Endorsing signals your support for ${contributor?.data?.name} to join ${terminal.data.name}.`}
      open={isEndorseModalOpen}
      toggle={(close) => {
        setError(false)
        setEndorsementMessage("")
        setIsEndorseModalOpen(close)
      }}
      error={error}
    >
      <div className="mt-12 px-[24px] flex-col items-center">
        <Button type="submit" onClick={handleEndorseClick} className="w-1/2 p-1">
          Endorse
        </Button>
        <p
          className={`${
            error ? "text-torch-red" : "text-marble-white"
          } text-center text-base mt-1 mb-[-10px] p-2`}
        >
          {endorsementMessage}
        </p>
      </div>
    </Modal>
  )
}

export default EndorseModal
