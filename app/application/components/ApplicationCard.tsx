import getStatusColor from "app/utils/getStatusColor"

// I don't really love this name because it only feels like an application before they are accepted
const ApplicationCard = ({ application, onClick }) => {
  return (
    <button
      role="button"
      tabIndex={0}
      onClick={onClick}
      className="border border-concrete w-[320px] cursor-pointer hover:border-marble-white p-3 flex flex-col"
    >
      <span className="flex flex-row items-center">
        <span
          className={`${getStatusColor(application.status)} h-2 w-2 rounded-full block mr-1`}
        ></span>
        <span className="text-xs text-marble-white uppercase tracking-wider">
          {application.status}
        </span>
      </span>
      <h2 className="mt-2 text-2xl text-marble-white">{application.initiative.data.name}</h2>
      <p className="text-base text-left ltext-marble-white mt-2">
        {application.initiative.data.oneLiner}
      </p>
      <div className="flex-auto flex justify-between mt-12 w-full">
        <span className="h-6 w-6 rounded-full bg-concrete border border-marble-white block place-content-start"></span>
        {application.status === "APPLIED" ? (
          <div className="place-content-end flex flex-row space-x-[-5px]">
            <span className="h-6 w-6 rounded-full bg-concrete border border-marble-white block"></span>
            <span className="h-6 w-6 rounded-full bg-concrete border border-marble-white block"></span>
            <span className="h-6 w-6 rounded-full bg-concrete border border-marble-white block"></span>
          </div>
        ) : (
          <div className="text-marble-white">12 POINTS</div>
        )}
      </div>
    </button>
  )
}

export default ApplicationCard
