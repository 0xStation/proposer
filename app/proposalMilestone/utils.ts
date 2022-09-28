import { Proposal } from "app/proposal/types"
import { ProposalMilestone, ProposalMilestoneStatus } from "./types"

export const getMilestoneStatus = (
  proposal: Proposal | null | undefined,
  milestone: ProposalMilestone | null | undefined
): ProposalMilestoneStatus | undefined => {
  if (!milestone || !proposal) {
    return undefined
  }
  if (milestone?.index < proposal?.currentMilestoneIndex) {
    return ProposalMilestoneStatus.COMPLETE
  } else if (milestone?.index === proposal?.currentMilestoneIndex) {
    return ProposalMilestoneStatus.IN_PROGRESS
  } else if (milestone?.index > proposal?.currentMilestoneIndex) {
    return ProposalMilestoneStatus.SCHEDULED
  }
  return undefined
}
