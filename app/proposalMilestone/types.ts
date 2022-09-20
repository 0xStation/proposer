import { ProposalMilestone as PrismaProposalMilestone } from "@prisma/client"
import { ProposalPayment } from "app/proposalPayment/types"

export type ProposalMilestone = PrismaProposalMilestone & {
  data: ProposalMilestoneMetadata
  status?: ProposalMilestoneStatus
  payments?: ProposalPayment[]
}

export type ProposalMilestoneMetadata = {
  // missing something on acceptance criteria, reviewers, etc.
  title: string
}

export enum ProposalMilestoneStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETE = "COMPLETE",
}
