import { Account } from "@prisma/client"

export type ProposalApprovalMetadata = {
  signature: string
}

export type ProposalApproval = {
  id: string
  proposalId: string
  signerAddress: string
  signerAccount: Account
  createdAt: Date
  data: ProposalApprovalMetadata
}
