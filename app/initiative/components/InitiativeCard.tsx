import { useState } from "react"
import ApplicationModal from "./ApplicationModal"
import { Image } from "blitz"

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
          {contributors.map((contributor) => {
            return contributor.data?.pfpURL ? (
              <div className="flex-2/5 m-auto ml-[-0.5px]">
                <Image src={contributor.data.pfpURL} alt="PFP" width={16} height={16} />
              </div>
            ) : (
              <span className="h-4 w-4 rounded-full bg-concrete border border-marble-white block ml-[-0.5px]"></span>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default InitiativeCard
