import { DateTime } from "luxon"
import { getNetworkName } from "app/core/utils/networkInfo"
import { ProposalNew } from "app/proposalNew/types"

export const ProposalMetadataView = ({
  proposal,
  className,
}: {
  proposal?: ProposalNew
  className?: string
}) => {
  return proposal ? (
    <div className={`${className} border border-b border-concrete rounded-2xl px-6 py-9`}>
      {/* NETWORK */}
      <h4 className="text-xs font-bold text-concrete uppercase">Network</h4>
      <p className="mt-2">
        {getNetworkName(proposal?.data?.totalPayments?.[0]?.token.chainId || 0)}
      </p>
      <div className="mt-6">
        <h4 className="text-xs font-bold text-concrete uppercase">Payment</h4>
        <p className="mt-2">
          {proposal?.data?.totalPayments?.[0]?.amount +
            " " +
            proposal?.data?.totalPayments?.[0]?.token.symbol}
        </p>
      </div>
      {proposal?.startDate && (
        <div className="mt-6 uppercase">
          <h4 className="text-xs font-bold text-concrete uppercase">Start date</h4>
          <p className="mt-2">
            {DateTime.fromJSDate(proposal.startDate as Date).toFormat("dd-MMM-yyyy")}{" "}
            {DateTime.fromJSDate(proposal.startDate as Date).toLocaleString(DateTime.TIME_SIMPLE)}
          </p>
        </div>
      )}
      {proposal?.endDate && (
        <div className="mt-6 uppercase">
          <h4 className="text-xs font-bold text-concrete">End date</h4>
          <p className="mt-2">
            {DateTime.fromJSDate(proposal.endDate as Date).toFormat("dd-MMM-yyyy")}{" "}
            {DateTime.fromJSDate(proposal.endDate as Date).toLocaleString(DateTime.TIME_SIMPLE)}
          </p>
        </div>
      )}
    </div>
  ) : (
    <div className="h-[300px] bg-wet-concrete shadow rounded-2xl motion-safe:animate-pulse" />
  )
}
