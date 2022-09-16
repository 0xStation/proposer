import { ProposalNewApproval as PrismaProposalNewApproval } from "@prisma/client"

export type ProposalNewApproval = PrismaProposalNewApproval & { data: ProposalNewApprovalMetadata }

export type ProposalNewApprovalMetadata = {
  type: ProposalNewApprovalType
  signature?: string
  message?: any
}

// the type of approval mechanism for a given approval
// future options will include snapshot-strategy-like things such as token votes
export enum ProposalNewApprovalType {
  SELF = "SELF",
  MULTISIG_QUORUM = "MULTISIG_QUORUM",
}
