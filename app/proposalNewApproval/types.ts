import { ProposalNewApproval as PrismaProposalNewApproval } from "@prisma/client"

export type ProposalNewApproval = PrismaProposalNewApproval & { data: ProposalNewApprovalMetadata }

export type ProposalNewApprovalMetadata = {
  type: ProposalNewApprovalType
  signature?: string
  message?: any
}

export enum ProposalNewApprovalType {
  SELF = "SELF",
  MULTISIG_QUORUM = "MULTISIG_QUORUM",
}
