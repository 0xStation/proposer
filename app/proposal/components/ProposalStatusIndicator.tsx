import ProposalStatusPill from "app/core/components/ProposalStatusPill"
import { ParticipantApprovalStatus, ProposalStatus } from "@prisma/client"
import ProgressCircleAndNumber from "app/core/components/ProgressCircleAndNumber"

export const ProposalStatusIndicator = ({ status, participants }) => {
  // numerator for the progress circle
  const totalApprovalCount =
    participants?.filter(
      (participant) =>
        participant.approvalStatus === ParticipantApprovalStatus.APPROVED ||
        participant.approvalStatus === ParticipantApprovalStatus.SENT // include author's SEND signature in net count too
    ).length || 0

  return (
    <div className="space-x-2 flex flex-row">
      <ProposalStatusPill status={status} />
      {(status === ProposalStatus.AWAITING_APPROVAL || status === ProposalStatus.APPROVED) && (
        <ProgressCircleAndNumber
          numerator={totalApprovalCount}
          denominator={participants?.length || 0}
        />
      )}
    </div>
  )
}
