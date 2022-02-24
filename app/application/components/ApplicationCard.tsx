import { ApplicationStatus } from "app/application/types"

// I don't really love this name because it only feels like an application before they are accepted
const ApplicationCard = ({ application, onClick }) => {
  const statusColor = (status: ApplicationStatus) => {
    switch (status) {
      case "APPLIED":
        return "bg-torch-red"

      case "INVITED":
        return "bg-neon-blue"

      default:
        return "bg-magic-mint"
    }
  }

  console.log(application)

  return (
    <div
      onClick={onClick}
      className="border border-concrete w-[320px] cursor-pointer hover:border-marble-white p-3 flex flex-col"
    >
      <span className="flex flex-row items-center">
        <span
          className={`${statusColor(application.status)} h-2 w-2 rounded-full block mr-1`}
        ></span>
        <span className="text-xs text-marble-white uppercase tracking-wider">
          {application.status}
        </span>
      </span>
      <h2 className="mt-2 text-2xl text-marble-white">{application.initiative.data.name}</h2>
      <p className="text-base text-marble-white mt-2">{application.initiative.data.oneLiner}</p>
      <div className="flex-auto flex justify-between mt-12">
        <span className="h-6 w-6 rounded-full bg-concrete border border-marble-white block self-end"></span>
        {application.status === "APPLIED" ? (
          <div className="self-end flex flex-row space-x-[-5px]">
            <span className="h-6 w-6 rounded-full bg-concrete border border-marble-white block"></span>
            <span className="h-6 w-6 rounded-full bg-concrete border border-marble-white block"></span>
            <span className="h-6 w-6 rounded-full bg-concrete border border-marble-white block"></span>
          </div>
        ) : (
          <div className="text-marble-white">12 POINTS</div>
        )}
      </div>
    </div>
  )
}

export default ApplicationCard
