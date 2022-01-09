import { useState } from "react"
import AccountModal from "../../application/components/AccountModal"
import ApplicationModal from "../../application/components/ApplicationModal"
import useStore from "../../core/hooks/useStore"
import { Account } from "../../account/types"

const InitiativeCard = ({ title, description, id, contributors }) => {
  let [applicationModalOpen, setApplicationModalOpen] = useState(false)
  let [accountModalOpen, setAccountModalOpen] = useState(false)
  const activeUser: Account | null = useStore((state) => state.activeUser)
  return (
    <>
      <AccountModal isOpen={accountModalOpen} setIsOpen={setAccountModalOpen} initiativeId={id} />
      <ApplicationModal
        isOpen={applicationModalOpen}
        setIsOpen={setApplicationModalOpen}
        initiativeId={id}
      />
      <div
        className="border border-concrete p-4 flex flex-col cursor-pointer"
        onClick={() => {
          activeUser ? setApplicationModalOpen(true) : setAccountModalOpen(true)
        }}
      >
        <h3 className="text-marble-white text-2xl">{title}</h3>
        <p className="text-marble-white text-xs mt-2 grow">{description}</p>
        <div className="mt-8 flex flex-row">
          <span className="h-4 w-4 rounded-full bg-concrete border border-marble-white block"></span>
          <span className="h-4 w-4 rounded-full bg-concrete border border-marble-white block ml-[-5px]"></span>
          <span className="h-4 w-4 rounded-full bg-concrete border border-marble-white block ml-[-5px]"></span>
        </div>
      </div>
    </>
  )
}

export default InitiativeCard
