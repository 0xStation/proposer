import { getNetworkName } from "app/core/utils/networkInfo"
import { Proposal } from "app/proposal/types"
import {
  MILESTONE_TERMS_TO_COPY,
  PAYMENT_TERM_MAP,
  SUPPORTED_CHAINS,
} from "app/core/utils/constants"
import { formatCurrencyAmount } from "../utils/formatCurrencyAmount"
import { useQuery } from "@blitzjs/rpc"
import getMilestonesByProposal from "app/proposalMilestone/queries/getMilestonesByProposal"

export const TotalPaymentView = ({
  proposal,
  className,
}: {
  proposal?: Proposal
  className?: string
}) => {
  const [milestones] = useQuery(
    getMilestonesByProposal,
    { proposalId: proposal?.id as string },
    {
      suspense: false,
      enabled: !!proposal?.id,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 60 * 1000, // 1 minute
    }
  )
  console.log("milestones", milestones)
  return proposal ? (
    <div className={`${className} border border-b border-concrete rounded-2xl px-6 py-6`}>
      {milestones &&
        milestones.map((milestone, idx) => {
          return (
            <div key={milestone?.id}>
              <h2 className="text-lg font-bold">{`Payment ${idx + 1}`}</h2>
              {milestone?.payments &&
                milestone?.payments.map((payment, idx) => {
                  return (
                    <div className="mt-4" key={milestone?.id}>
                      <div className="grid grid-cols-5 bg-wet-concrete-50 rounded">
                        <div className="mx-4 mt-4">
                          <div className="font-bold border-r border-concrete">Network</div>
                          <div className="text-left border-r border-concrete pr-8 pt-2">
                            {
                              SUPPORTED_CHAINS.find(
                                (chain) => chain.id === payment?.data?.token?.chainId
                              )?.name
                            }
                          </div>
                        </div>
                        <div className="m-4 col-span-2">
                          <div className="font-bold border-r border-concrete">Amount and token</div>
                          <div className="border-r border-concrete pt-2">
                            {formatCurrencyAmount(payment?.amount?.toString())}{" "}
                            {payment?.data?.token?.symbol}
                          </div>
                        </div>
                        <div className="m-4 col-span-2">
                          <div className="font-bold">Funding condition</div>
                          <div className="pt-2">
                            {MILESTONE_TERMS_TO_COPY[milestone?.data?.title]}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold mt-4">Funding recipient</div>
                      <div className="font-bold mt-4">Payment recipient</div>
                    </div>
                  )
                })}
            </div>
          )
        })}
    </div>
  ) : (
    <div className="h-[300px] bg-wet-concrete shadow rounded-2xl motion-safe:animate-pulse" />
  )
}

export default TotalPaymentView

// <div className="font-bold border-r border-concrete">Amount and token</div>
// <div className="font-bold">Funding condition</div>
