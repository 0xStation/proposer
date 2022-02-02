const InitiativeCard = ({ title, description, contributors }) => {
  return (
    <div className="border border-concrete p-4 flex flex-col cursor-pointer h-full hover:border-marble-white">
      <h3 className="text-marble-white text-lg">{title}</h3>
      <p className="text-marble-white text-base mt-2 grow">{description}</p>
      <div className="mt-8 flex flex-row">
        <span className="h-4 w-4 rounded-full bg-concrete border border-marble-white block"></span>
        <span className="h-4 w-4 rounded-full bg-concrete border border-marble-white block ml-[-5px]"></span>
        <span className="h-4 w-4 rounded-full bg-concrete border border-marble-white block ml-[-5px]"></span>
      </div>
    </div>
  )
}

export default InitiativeCard
