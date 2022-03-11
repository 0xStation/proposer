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
    terminal.contracts?.addresses?.endorsements
  )

  const [subgraphData]: [ApplicationSubgraphData | undefined, any] = useQuery(
    getSubgraphApplicationData,
    {
      referralGraphAddress: application.initiative.terminal.data.contracts.addresses.referrals,
      initiativeLocalId: application.initiative.localId,
      terminalId: application.initiative.terminalId,
      address: address,
    },
    { suspense: false }
  )

  console.log(!!parseDecimals(subgraphData?.points, decimals))

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
          className="h-8 w-8 rounded-full border border-marble-white block self-end"
        />
        {application.status === "APPLIED" ? (
          <div className="text-marble-white self-end">
            {(subgraphData && parseDecimals(subgraphData.points, decimals)) || "0"}{" "}
            {terminal.data.contracts.symbols.points}
          </div>
        ) : null}
      </div>
    </button>
  )
}

export default ApplicationCard
