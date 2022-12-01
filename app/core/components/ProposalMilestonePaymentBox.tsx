import { ProposalMilestone } from "app/proposalMilestone/types"
import { getMilestoneStatus } from "app/proposalMilestone/utils"
import {
  PROPOSAL_MILESTONE_STATUS_MAP,
  PAYMENT_ATTEMPT_STATUS_DISPLAY_MAP,
} from "../utils/constants"
import truncateString from "../utils/truncateString"
import { Proposal } from "app/proposal/types"
import { formatCurrencyAmount } from "../utils/formatCurrencyAmount"
import PaymentAction from "./stepper/actions/PaymentAction"
import { getTransactionLink } from "../utils/getTransactionLink"
import TextLink from "./TextLink"
import { convertJSDateToDateAndTime } from "app/core/utils/convertJSDateToDateAndTime"
import { getMostRecentPaymentAttempt } from "app/proposalPayment/utils"
import { ProposalPaymentStatus } from "app/proposalPayment/types"

const PaymentRow = ({ proposal, milestone, payment }) => {
  const mostRecentPaymentAttempt = getMostRecentPaymentAttempt(payment)

  return (
    <div>
      <div className="w-full flex flex-row items-end" key={payment?.id}>
        <span className="basis-36 mb-2 tracking-wider">
          {truncateString(payment?.senderAddress)}
        </span>
        <span className="basis-36 ml-6 mb-2 tracking-wider">
          {truncateString(payment?.recipientAddress)}
        </span>
        <span className="basis-32 ml-6 mb-2 tracking-wider">{payment?.data?.token?.symbol}</span>
        <span className="basis-32 ml-6 mb-2 tracking-wider">
          {formatCurrencyAmount(payment?.amount?.toString())}
        </span>
      </div>
      {payment.data?.history?.length > 0 && (
        <h4 className="text-concrete uppercase text-xs font-bold tracking-wider my-2">History</h4>
      )}
      <div className="space-y-4">
        {payment.data?.history?.map((attempt, idx) => {
          return (
            <div className="flex flex-row" key={`attempt-${idx}`}>
              <span
                className={`${
                  PAYMENT_ATTEMPT_STATUS_DISPLAY_MAP[attempt.status].bgColor
                } w-2 rounded-l block`}
              ></span>
              <div className="bg-wet-concrete w-full px-2 py-1 rounded-r flex flex-row items-center justify-between">
                <span>
                  Transaction was{" "}
                  <span
                    className={`${PAYMENT_ATTEMPT_STATUS_DISPLAY_MAP[attempt.status].textColor}`}
                  >
                    {PAYMENT_ATTEMPT_STATUS_DISPLAY_MAP[attempt.status].copy}
                  </span>{" "}
                  on {convertJSDateToDateAndTime({ timestamp: new Date(attempt.timestamp) })}
                </span>
                {(attempt.status === ProposalPaymentStatus.SUCCESS ||
                  attempt.status === ProposalPaymentStatus.FAILED) && (
                  <TextLink
                    url={getTransactionLink(payment.data.token.chainId, attempt.transactionHash)}
                    className="text-sm text-tunnel-black"
                  >
                    See transaction
                  </TextLink>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4">
        <PaymentAction
          proposal={proposal}
          milestone={milestone}
          payment={payment}
          isWithinStepper={false}
        />
      </div>
    </div>
  )
}

export const ProposalMilestonePaymentBox = ({
  proposal,
  milestone,
  className,
}: {
  proposal: Proposal
  milestone: ProposalMilestone
  className?: string
}) => {
  const milestoneStatus = getMilestoneStatus(proposal, milestone) || ""

  return (
    <>
      <div className={`border border-b border-concrete rounded-2xl px-6 py-9 ${className}`}>
        <div className="flex flex-row items-center justify-between mb-4">
          {/* TITLE */}
          <span>{milestone?.data?.title || "title"}</span>
          {/* STATUS */}
          <div className="flex flex-col items-end space-y-1">
            <div className="flex flex-row items-center space-x-1">
              <span
                className={`h-2 w-2 rounded-full ${PROPOSAL_MILESTONE_STATUS_MAP[milestoneStatus]?.color}`}
              />
              <div className="font-bold text-xs uppercase tracking-wider">
                {PROPOSAL_MILESTONE_STATUS_MAP[milestoneStatus]?.copy}
              </div>
            </div>
          </div>
        </div>
        {/* TABLE HEADER */}
        <div className=" text-concrete uppercase text-xs font-bold w-full flex flex-row items-end">
          <span className="basis-36 mb-2 tracking-wider">From</span>
          <span className="basis-36 ml-6 mb-2 tracking-wider">To</span>
          <span className="basis-32 ml-6 mb-2 tracking-wider">Token</span>
          <span className="basis-32 ml-6 mb-2 tracking-wider">Amount</span>
        </div>
        {/* MILESTONE PAYMENTS */}
        <div className="space-y-8">
          {milestone?.payments &&
            milestone?.payments.map((payment, idx) => (
              <PaymentRow
                key={`payment-row-${idx}`}
                payment={payment}
                proposal={proposal}
                milestone={milestone}
              />
            ))}
        </div>
      </div>
    </>
  )
}

export default ProposalMilestonePaymentBox
