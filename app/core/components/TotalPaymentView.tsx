import { DateTime } from "luxon"
import { getNetworkName } from "app/core/utils/networkInfo"
import { ProposalNew } from "app/proposalNew/types"
import { PAYMENT_TERM_MAP } from "app/core/utils/constants"

export const TotalPaymentView = ({
  proposal,
  className,
}: {
  proposal?: ProposalNew
  className?: string
}) => {
  return proposal ? (
    <div className={`${className} border border-b border-concrete rounded-2xl px-6 py-9`}>
      <h2 className="font-bold text-xl">Total Payment</h2>
      {/* NETWORK */}
      <h4 className="text-xs font-bold text-concrete uppercase mt-6">Network</h4>
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
      <div className="mt-6">
        <h4 className="text-xs font-bold text-concrete uppercase">Payment Terms</h4>
        <p className="mt-2">{PAYMENT_TERM_MAP[proposal?.data?.paymentTerms].copy}</p>
      </div>
    </div>
  ) : (
    <div className="h-[300px] bg-wet-concrete shadow rounded-2xl motion-safe:animate-pulse" />
  )
}

export default TotalPaymentView
