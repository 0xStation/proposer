import { Account, Checkbook, Prisma } from "@prisma/client"
import { CheckApproval } from "@prisma/client"
import { Proposal } from "app/proposal/types"

export enum CheckStatus {
  NOT_QUEUED = "NOT QUEUED", // for checks that represent future milestones that have yet to be kickstarted
  PENDING_APPROVAL = "PENDING APPROVAL", // queued and currently in approval process
  UNCLAIMED = "UNCLAIMED", // approved but not cashed by recipient
  CASHED = "CASHED", // cashed by recipient post-approval
}

export type Check = {
  id: string
  proposalId: string
  chainId: number
  fundingAddress: string
  recipientAddress: string
  tokenAddress: string
  tokenAmount: Prisma.Decimal
  deadline: Date
  nonce: number
  approvals: CheckApproval[]
  txnHash?: string
  proposal?: Proposal
  checkbook?: Checkbook
  recipientAccount?: Account
}
