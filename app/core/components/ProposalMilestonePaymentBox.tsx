import { useState } from "react"
import { CheckCircleIcon } from "@heroicons/react/solid"
import ExecutePaymentModal from "app/proposal/components/ExecutePaymentModal"
import { ProposalMilestone, ProposalMilestoneStatus } from "app/proposalMilestone/types"
import { getMilestoneStatus } from "app/proposalMilestone/utils"
import { PROPOSAL_MILESTONE_STATUS_MAP } from "../utils/constants"
import truncateString from "../utils/truncateString"
import Button, { ButtonType } from "./sds/buttons/Button"
import { ProposalRoleType } from "@prisma/client"
import { addressesAreEqual } from "../utils/addressesAreEqual"
import useStore from "../hooks/useStore"
import { Proposal } from "app/proposal/types"
import { formatCurrencyAmount } from "../utils/formatCurrencyAmount"
import { getNetworkExplorer } from "app/core/utils/networkInfo"

export const ProposalMilestonePaymentBox = ({
  proposal,
  milestone,
  className,
}: {
  proposal: Proposal
  milestone: ProposalMilestone
  className?: string
}) => {
  const activeUser = useStore((state) => state.activeUser)
  const [isExecutePaymentModalOpen, setIsExecutePaymentModalOpen] = useState<boolean>(false)

  const userIsPayer = proposal?.roles?.some(
    (role) =>
      role.type === ProposalRoleType.CLIENT &&
      addressesAreEqual(activeUser?.address || "", role.address)
  )
  const paymentComplete = !!milestone?.payments?.[0]?.transactionHash

  return (
    <>
      <ExecutePaymentModal
        isOpen={isExecutePaymentModalOpen}
        setIsOpen={setIsExecutePaymentModalOpen}
        milestone={milestone}
      />
      <div className={`border border-b border-concrete rounded-2xl px-6 py-9 ${className}`}>
        <span
          className={`${
            PROPOSAL_MILESTONE_STATUS_MAP[getMilestoneStatus(proposal, milestone) || ""]?.color
          } rounded-full px-2 py-1 flex items-center space-x-1 w-fit mb-4`}
        >
          <span className="text-xs uppercase text-tunnel-black font-bold">
            {PROPOSAL_MILESTONE_STATUS_MAP[getMilestoneStatus(proposal, milestone) || ""]?.copy}
          </span>
        </span>
        <div className=" text-concrete uppercase text-xs font-bold w-full flex flex-row items-end">
          <span className="basis-32 mb-2 tracking-wider">From</span>
          <span className="basis-32 ml-6 mb-2 tracking-wider">To</span>
          <span className="basis-28 ml-6 mb-2 tracking-wider">Token</span>
          <span className="basis-28 ml-6 mb-2 tracking-wider">Amount</span>
          <span className="basis-28"></span>
        </div>
        {/* show all payments within milestone block */}
        {milestone?.payments?.map((payment) => (
          <div className="w-full flex flex-row items-end" key={payment?.id}>
            <span className="basis-32 mb-2 tracking-wider">
              {truncateString(payment?.senderAddress)}
            </span>
            <span className="basis-32 ml-6 mb-2 tracking-wider">
              {truncateString(payment?.recipientAddress)}
            </span>
            <span className="basis-28 ml-6 mb-2 tracking-wider">
              {payment?.data?.token?.symbol}
            </span>
            <span className="basis-28 ml-6 mb-2 tracking-wider">
              {formatCurrencyAmount(payment?.amount?.toString())}
            </span>
            <span className="basis-28 mb-2">
              {payment.transactionHash && (
                <a
                  className="text-sm text-electric-violet"
                  target="_blank"
                  href={`${getNetworkExplorer[payment.data.token.chainId].explorer}/tx/${
                    payment.transactionHash
                  }`}
                  rel="noreferrer"
                >
                  See transaction
                </a>
              )}
            </span>
          </div>
        ))}
        {userIsPayer &&
          // proactive logic for when we have multiple milestone payment blocks -> only the current milestone should be payable
          getMilestoneStatus(proposal, milestone) === ProposalMilestoneStatus.IN_PROGRESS &&
          (!paymentComplete ? (
            <Button
              overrideWidthClassName="w-full"
              className="mt-4"
              type={ButtonType.Secondary}
              onClick={() => setIsExecutePaymentModalOpen(true)}
            >
              Pay
            </Button>
          ) : (
            <button
              className="mt-4 mb-2 sm:mb-0 border rounded w-[300px] sm:w-[400px] md:w-[614px] h-[35px] mr-3 opacity-70 bg-electric-violet border-electric-violet text-tunnel-black cursor-not-allowed"
              disabled
            >
              <CheckCircleIcon className="h-5 w-5 inline mb-1 mr-2" />
              Paid
            </button>
          ))}
      </div>
    </>
  )
}

export default ProposalMilestonePaymentBox
