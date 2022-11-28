import { useQuery } from "@blitzjs/rpc"
import getGnosisTxStatus from "app/proposal/queries/getGnosisTxStatus"
import { ProposalMilestoneStatus } from "app/proposalMilestone/types"
import { getMilestoneStatus } from "app/proposalMilestone/utils"
import { useSafeMetadata } from "./useSafeMetadata"

export const useSafeTxStatus = (proposal, milestone, payment) => {
  const address = payment?.data.multisigTransaction?.address
  const addressType = payment?.data.multisigTransaction?.type
  const chainId = payment?.data.token.chainId || 1

  const safeMetadata = useSafeMetadata(address, addressType, chainId)

  const [gnosisTxStatus] = useQuery(
    getGnosisTxStatus,
    {
      chainId,
      transactionHash: payment?.data.multisigTransaction?.safeTxHash || "",
      proposalId: proposal.id,
      milestoneId: milestone.id,
    },
    {
      suspense: false,
      // refetchOnWindowFocus defaults to true so switching tabs will re-trigger query for immediate response feel
      refetchInterval: 30 * 1000, // 30 seconds, background refresh rate in-case user doesn't switch around tabs
      staleTime: 30 * 1000,
      enabled:
        // payment exists
        payment &&
        // milestone is in progress
        getMilestoneStatus(proposal, milestone) === ProposalMilestoneStatus.IN_PROGRESS &&
        // payment is still pending
        !payment.transactionHash &&
        // payment has been queued to Gnosis
        !!payment.data.multisigTransaction?.safeTxHash,
    }
  )

  const isLoading = !safeMetadata || !gnosisTxStatus

  return {
    isLoading,
    isNonceBlocked: isLoading ? false : safeMetadata.nonce < gnosisTxStatus.nonce,
    confirmations: isLoading ? [] : gnosisTxStatus.confirmations,
  }
}
