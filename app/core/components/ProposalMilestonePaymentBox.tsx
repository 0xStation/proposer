import { useState, useEffect } from "react"
import { useQuery } from "blitz"
import { ArrowRightIcon, CheckCircleIcon } from "@heroicons/react/solid"
import ExecutePaymentModal from "app/proposal/components/ExecutePaymentModal"
import AttachTransactionModal from "app/proposal/components/AttachTransactionModal"
import { ProposalMilestone, ProposalMilestoneStatus } from "app/proposalMilestone/types"
import { getMilestoneStatus } from "app/proposalMilestone/utils"
import { PROPOSAL_MILESTONE_STATUS_MAP } from "../utils/constants"
import truncateString from "../utils/truncateString"
import Button, { ButtonType } from "./sds/buttons/Button"
import { addressesAreEqual } from "../utils/addressesAreEqual"
import useStore from "../hooks/useStore"
import { Proposal } from "app/proposal/types"
import { formatCurrencyAmount } from "../utils/formatCurrencyAmount"
import { getNetworkExplorer } from "app/core/utils/networkInfo"
import QueueGnosisTransactionModal from "app/proposalPayment/components/QueueGnosisTransactionModal"
import { getNetworkGnosisUrl } from "app/core/utils/networkInfo"
import { getGnosisSafeDetails } from "app/utils/getGnosisSafeDetails"
import getGnosisTxStatus from "app/proposal/queries/getGnosisTxStatus"

const PaymentInProgressStatus = ({ milestone, proposal }) => {
  useQuery(
    getGnosisTxStatus,
    {
      chainId: (milestone.payments && milestone.payments[0]?.data.token.chainId) || 1,
      transactionHash:
        (milestone.payments && milestone.payments[0]?.data.multisigTransaction?.safeTxHash) || "",
      proposalId: proposal.id,
      milestoneId: milestone.id,
    },
    {
      refetchInterval: 60 * 1000, // 1 minute
    }
  )

  return (
    <PaymentStatus
      color={PROPOSAL_MILESTONE_STATUS_MAP[ProposalMilestoneStatus.IN_PROGRESS].color}
      copy={PROPOSAL_MILESTONE_STATUS_MAP[ProposalMilestoneStatus.IN_PROGRESS].copy}
    />
  )
}

const PaymentScheduledStatus = ({ milestone, proposal }) => {
  useQuery(
    getGnosisTxStatus,
    {
      chainId: (milestone.payments && milestone.payments[0]?.data.token.chainId) || 1,
      transactionHash:
        (milestone.payments && milestone.payments[0]?.data.multisigTransaction?.safeTxHash) || "",
      proposalId: proposal.id,
      milestoneId: milestone.id,
    },
    {
      refetchInterval: 60 * 1000, // 1 minute
    }
  )

  return (
    <PaymentStatus
      color={PROPOSAL_MILESTONE_STATUS_MAP[ProposalMilestoneStatus.SCHEDULED].color}
      copy={PROPOSAL_MILESTONE_STATUS_MAP[ProposalMilestoneStatus.SCHEDULED].copy}
    />
  )
}

const PaymentPaidStatus = () => {
  return (
    <PaymentStatus
      color={PROPOSAL_MILESTONE_STATUS_MAP[ProposalMilestoneStatus.COMPLETE].color}
      copy={PROPOSAL_MILESTONE_STATUS_MAP[ProposalMilestoneStatus.COMPLETE].copy}
    />
  )
}

const PaymentStatus = ({ color, copy }) => {
  return (
    <div className="flex flex-col items-end space-y-1">
      <div className="flex flex-row items-center space-x-1">
        <span className={`h-2 w-2 rounded-full ${color}`} />
        <div className="font-bold text-xs uppercase tracking-wider">{copy}</div>
      </div>
    </div>
  )
}

const PaymentRow = ({
  payment,
  proposal,
  milestone,
  setQueueGnosisTransactionModalOpen,
  setIsExecutePaymentModalOpen,
  setIsAttachtxModalOpen,
}) => {
  const setToastState = useStore((state) => state.setToastState)
  const activeUser = useStore((state) => state.activeUser)
  const [safeDetails, setSafeDetails] = useState<{
    chainId: number
    address: string
    quorum: any
    signers: any
  }>()

  // going to be running this no matter what type of address is payer
  // possible improvement would be to store the type of address on a payment and only run on safe
  useEffect(() => {
    const getSafeDetails = async () => {
      try {
        const details = await getGnosisSafeDetails(
          payment.data.token.chainId,
          payment.senderAddress
        )
        // undefined if the gnosis api returns null, aka not a safe (likely 404)
        details ? setSafeDetails(details) : setSafeDetails(undefined)
      } catch (e) {
        console.error(e)
        setToastState({
          isToastShowing: true,
          type: "error",
          message: e.message,
        })
      }
    }
    getSafeDetails()
  }, [payment])

  const userIsPayer = activeUser
    ? addressesAreEqual(activeUser.address, payment.senderAddress)
    : false

  const userIsSigner =
    safeDetails && activeUser
      ? safeDetails.signers?.some((signer) => {
          return addressesAreEqual(activeUser.address, signer)
        })
      : false

  const paymentComplete = !!milestone?.payments?.[0]?.transactionHash

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
      {/* check if gnosis safe and active user is signer */}
      {getMilestoneStatus(proposal, milestone) === ProposalMilestoneStatus.IN_PROGRESS &&
        userIsSigner &&
        (!payment.data.multisigTransaction ? (
          <Button
            overrideWidthClassName="w-full"
            className="mt-4"
            type={ButtonType.Secondary}
            onClick={() => {
              setQueueGnosisTransactionModalOpen(true)
            }}
          >
            Queue Gnosis transaction
          </Button>
        ) : (
          <>
            <a
              href={`${getNetworkGnosisUrl(payment.data.token.chainId)}:${
                payment.data.multisigTransaction.address
              }/transactions/queue`}
              target="_blank"
              rel="noreferrer"
            >
              <button className="mt-4 mb-2 sm:mb-0 border rounded w-[300px] sm:w-[400px] md:w-[614px] h-[35px] bg-electric-violet border-electric-violet text-tunnel-black">
                Execute on Gnosis
                <ArrowRightIcon className="h-4 w-4 inline mb-1 ml-2 rotate-[315deg]" />
              </button>
            </a>
            <span
              className="text-electric-violet text-xs mt-2 cursor-pointer"
              onClick={() => {
                setIsAttachtxModalOpen(true)
              }}
            >
              Paste a transaction link
            </span>
          </>
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
  const [isExecutePaymentModalOpen, setIsExecutePaymentModalOpen] = useState<boolean>(false)
  const [isAttachtxModalOpen, setIsAttachtxModalOpen] = useState<boolean>(false)
  const [queueGnosisTransactionModalOpen, setQueueGnosisTransactionModalOpen] =
    useState<boolean>(false)

  const milestoneStatus = getMilestoneStatus(proposal, milestone)

  return (
    <>
      <ExecutePaymentModal
        isOpen={isExecutePaymentModalOpen}
        setIsOpen={setIsExecutePaymentModalOpen}
        milestone={milestone}
      />
      <QueueGnosisTransactionModal
        milestone={milestone}
        isOpen={queueGnosisTransactionModalOpen}
        setIsOpen={setQueueGnosisTransactionModalOpen}
      />
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
          {milestoneStatus === ProposalMilestoneStatus.COMPLETE && <PaymentPaidStatus />}
          {milestoneStatus === ProposalMilestoneStatus.IN_PROGRESS && (
            <PaymentInProgressStatus proposal={proposal} milestone={milestone} />
          )}
          {milestoneStatus === ProposalMilestoneStatus.SCHEDULED && (
            <PaymentScheduledStatus proposal={proposal} milestone={milestone} />
          )}
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
            setQueueGnosisTransactionModalOpen={setQueueGnosisTransactionModalOpen}
            setIsExecutePaymentModalOpen={setIsExecutePaymentModalOpen}
            setIsAttachtxModalOpen={setIsAttachtxModalOpen}
            proposal={proposal}
            milestone={milestone}
          />
        ))}
      </div>
    </>
  )
}

export default ProposalMilestonePaymentBox
