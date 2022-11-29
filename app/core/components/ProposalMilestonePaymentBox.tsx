import { useState } from "react"
import AttachTransactionModal from "app/proposal/components/AttachTransactionModal"
import { ProposalMilestone } from "app/proposalMilestone/types"
import { getMilestoneStatus } from "app/proposalMilestone/utils"
import {
  PROPOSAL_MILESTONE_STATUS_MAP,
  PAYMENT_ATTEMPT_STATUS_DISPLAY_MAP,
} from "../utils/constants"
import truncateString from "../utils/truncateString"
import { Proposal } from "app/proposal/types"
import { formatCurrencyAmount } from "../utils/formatCurrencyAmount"
import { getNetworkExplorer } from "app/core/utils/networkInfo"
import PaymentAction from "./stepper/actions/PaymentAction"
import { getTransactionLink } from "../utils/getTransactionLink"
import TextLink from "./TextLink"
import { formatDate } from "app/core/utils/formatDate"

const PaymentRow = ({ proposal, milestone, payment }) => {
  return (
    <div>
      <div className="w-full flex flex-row items-end" key={payment?.id}>
        <span className="basis-32 mb-2 tracking-wider">
          {truncateString(payment?.senderAddress)}
        </span>
        <span className="basis-32 ml-6 mb-2 tracking-wider">
          {truncateString(payment?.recipientAddress)}
        </span>
        <span className="basis-28 ml-6 mb-2 tracking-wider">{payment?.data?.token?.symbol}</span>
        <span className="basis-28 ml-6 mb-2 tracking-wider">
          {formatCurrencyAmount(payment?.amount?.toString())}
        </span>
        <span className="basis-28 mb-2">
          {payment.transactionHash && (
            <TextLink url={getTransactionLink(payment.data.token.chainId, payment.transactionHash)}>
              See transaction
            </TextLink>
          )}
        </span>
      </div>
      <div className="space-y-4">
        {payment.data?.history?.map((attempt, idx) => {
          return (
            <div className="flex flex-row" key={`attempt-${idx}`}>
              <span
                className={`${
                  PAYMENT_ATTEMPT_STATUS_DISPLAY_MAP[attempt.status].bgColor
                } w-2 rounded-l block`}
              ></span>
              <div className="bg-wet-concrete w-full px-2 py-1 block rounded-r">
                Transaction was{" "}
                <span className={`${PAYMENT_ATTEMPT_STATUS_DISPLAY_MAP[attempt.status].textColor}`}>
                  {PAYMENT_ATTEMPT_STATUS_DISPLAY_MAP[attempt.status].copy}
                </span>{" "}
                on {formatDate(new Date(attempt.timestamp))}
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
  const [isAttachtxModalOpen, setIsAttachtxModalOpen] = useState<boolean>(false)
  const milestoneStatus = getMilestoneStatus(proposal, milestone) || ""

  return (
    <>
      <AttachTransactionModal
        milestone={milestone}
        isOpen={isAttachtxModalOpen}
        setIsOpen={setIsAttachtxModalOpen}
      />
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
          <span className="basis-32 mb-2 tracking-wider">From</span>
          <span className="basis-32 ml-6 mb-2 tracking-wider">To</span>
          <span className="basis-28 ml-6 mb-2 tracking-wider">Token</span>
          <span className="basis-28 ml-6 mb-2 tracking-wider">Amount</span>
          <span className="basis-28"></span>
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
