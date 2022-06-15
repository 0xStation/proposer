import { ProposalStatus } from "@prisma/client"
import { FundingSignature } from "app/types"

export enum CheckStatus {
  NOT_QUEUED, // for checks that represent future milestones that have yet to be kickstarted
  PENDING_APPROVAL, // queued and currently in approval process
  UNCLAIMED, // approved, but not cashed by recipient
  CASHED, // cashed by recipient post-approval
}

export type ProposalMetadata = {
  content: {
    title: string
    body: string
  }
  funding: {
    recipientAddress: string
    token: string
    amount: number
  }
  startDate: Date
  endDate: Date
  signatures: FundingSignature[] // copy of signatures used for approving first milestone
  milestones: {
    amount: number // compute percentage breakdown by diving this amount by total funding amount
    status: CheckStatus
    fundingSignatures: FundingSignature[]
    transactionHash?: string // set once check is cashed showing proof of payment
  }[]
}

export type Proposal = {
  fundingAddress: string
  status: ProposalStatus
  data: ProposalMetadata
  createdAt: Date
}
