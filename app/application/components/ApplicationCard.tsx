import getStatusColor from "app/utils/getStatusColor"
import { useQuery } from "blitz"
import getSubgraphApplicationData from "app/application/queries/getSubgraphApplicationData"
import { DEFAULT_NUMBER_OF_DECIMALS } from "app/core/utils/constants"
import { useDecimals } from "app/core/contracts/contracts"
import { ApplicationSubgraphData } from "app/application/types"

const parseDecimals = (val, decimals) => {
  return val * Math.pow(10, 0 - decimals)
}

// I don't really love this name because it only feels like an application before they are accepted
const ApplicationCard = ({ application, address, onClick }) => {
  const { terminal } = application?.initiative
  const { decimals = DEFAULT_NUMBER_OF_DECIMALS } = useDecimals(
    terminal?.contracts?.addresses.endorsements
  )

  const [subgraphData]: [ApplicationSubgraphData | undefined, any] = useQuery(
    getSubgraphApplicationData,
    {
      // referralGraphAddress: application.initiative.terminal.data.contracts.addresses.referrals,
      referralGraphAddress: "0x488d547e5c383d66815c67fb1356a3f35d3885cf",
      initiativeLocalId: 3,
      // initiativeLocalId: application.initiative.localId,
      terminalId: application.initiative.terminalId,
      // address: "address",
      address: "0x0259d65954dfbd0735e094c9cdacc256e5a29dd4",
    },
    { suspense: false }
  )

  console.log(subgraphData)

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
        <img
          src={terminal.data.pfpURL}
          alt={`Terminal ${terminal && terminal?.data?.name} PFP`}
          className="h-8 w-8 rounded border border-marble-white block self-end"
        />
        {application.status === "APPLIED" ? (
          <div className="text-marble-white self-end">
            {subgraphData && parseDecimals(subgraphData.points, decimals)} POINTS
          </div>
        ) : (
          <div className="self-end flex flex-row space-x-[-5px]">
            <span className="h-8 w-8 rounded-full bg-concrete border border-marble-white block"></span>
            <span className="h-8 w-8 rounded-full bg-concrete border border-marble-white block"></span>
            <span className="h-8 w-8 rounded-full bg-concrete border border-marble-white block"></span>
          </div>
        )}
      </div>
    </button>
  )
}

export default ApplicationCard
