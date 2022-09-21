import { ProposalNew } from "app/proposalNew/types"
import { ProposalMilestone, ProposalMilestoneStatus } from "./types"

export const getMilestoneStatus = (
  proposal: ProposalNew | null | undefined,
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
