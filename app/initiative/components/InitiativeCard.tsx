import { useState } from "react"
import ApplicationModal from "./ApplicationModal"

const InitiativeCard = ({ title, description, contributors }) => {
  let [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <ApplicationModal isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        className="border border-concrete p-4 flex flex-col cursor-pointer"
        onClick={() => {
          setIsOpen(true)
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
