import { useQuery } from "@blitzjs/rpc"
import getGnosisTxStatus from "app/proposal/queries/getGnosisTxStatus"
import { ProposalMilestoneStatus } from "app/proposalMilestone/types"
import { getMilestoneStatus } from "app/proposalMilestone/utils"
import { ProposalPaymentStatus } from "app/proposalPayment/types"
import { getMostRecentPaymentAttempt } from "app/proposalPayment/utils"
import { useSafeMetadata } from "./useSafeMetadata"

export const useSafeTxStatus = (proposal, milestone, payment) => {
  const mostRecentPaymentAttempt = getMostRecentPaymentAttempt(payment)

  const chainId = payment?.data.token.chainId || 1

  const [gnosisTxStatus] = useQuery(
    getGnosisTxStatus,
    {
      chainId,
      safeTxHash: mostRecentPaymentAttempt?.multisigTransaction?.safeTxHash || "",
      proposalId: proposal.id,
      milestoneId: milestone.id,
    },
    {
      suspense: false,
      // refetchOnWindowFocus defaults to true so switching tabs will re-trigger query for immediate response feel
      refetchInterval: 30 * 1000, // 30 seconds, background refresh rate in-case user doesn't switch around tabs
      staleTime: 30 * 1000,
      enabled:
        // payment attempt exists
        mostRecentPaymentAttempt &&
        // payment attempt is still pending
        mostRecentPaymentAttempt.status === ProposalPaymentStatus.QUEUED &&
        // payment has been queued to Safe
        !!mostRecentPaymentAttempt?.multisigTransaction?.safeTxHash,
    }
  )

  return {
    confirmations: gnosisTxStatus?.confirmations,
  }
}
