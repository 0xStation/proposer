import { APPLICATION_STATUS_MAP } from "app/core/utils/constants"

// I don't really love this name because it only feels like an application before they are accepted
const ApplicationCard = ({ application, address, onClick }) => {
  const { terminal } = application?.initiative

  return (
    <button
      role="button"
      tabIndex={0}
      onClick={onClick}
      className="border border-concrete cursor-pointer hover:border-marble-white p-3 flex flex-col"
    >
      <span className="flex flex-row items-center">
        <span
          className={`${
            APPLICATION_STATUS_MAP[application.status]?.color
          } h-2 w-2 rounded-full block mr-1`}
        ></span>
        <span className="text-xs text-marble-white uppercase tracking-wider">
          {APPLICATION_STATUS_MAP[application.status]?.status}
        </span>
      </span>
      <h2 className="mt-2 text-2xl text-marble-white">{application.initiative.data.name}</h2>
      <p className="text-base text-left ltext-marble-white mt-2">
        {application.initiative.data.oneLiner}
      </p>
      <div className="flex-auto flex justify-between mt-12 w-full">
        <img
          src={terminal.data.pfpURL}
          alt={`Terminal ${terminal && terminal?.data?.name} PFP`}
          className="h-8 w-8 rounded-full border border-marble-white block self-end"
        />
      </div>
    </button>
  )
}

export default ApplicationCard
