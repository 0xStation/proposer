import { useState } from "react"
import AttachTransactionModal from "app/proposal/components/AttachTransactionModal"
import { ProposalMilestone } from "app/proposalMilestone/types"
import { getMilestoneStatus } from "app/proposalMilestone/utils"
import { PROPOSAL_MILESTONE_STATUS_MAP } from "../utils/constants"
import truncateString from "../utils/truncateString"
import { Proposal } from "app/proposal/types"
import { formatCurrencyAmount } from "../utils/formatCurrencyAmount"
import { getNetworkExplorer } from "app/core/utils/networkInfo"
import PaymentAction from "./stepper/actions/PaymentAction"

const PaymentRow = ({ payment, proposal, milestone }) => {
  return (
    <>
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
            <a
              className="text-sm text-electric-violet"
              target="_blank"
              href={`${getNetworkExplorer(payment.data.token.chainId)}/tx/${
                payment.transactionHash
              }`}
              rel="noreferrer"
            >
              See transaction
            </a>
          )}
        </span>
      </div>
      <div className="mt-4">
        <PaymentAction proposal={proposal} milestone={milestone} />
      </div>
    </>
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
        {milestone?.payments?.map((payment, idx) => (
          <PaymentRow
            key={`payment-row-${idx}`}
            payment={payment}
            proposal={proposal}
            milestone={milestone}
          />
        ))}
      </div>
    </>
  )
}

export default ProposalMilestonePaymentBox
