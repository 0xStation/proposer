import { Account, ProposalStatus } from "@prisma/client"

export enum ReferralType {
  TWITTER = "TWITTER",
  NEWSLETTER_PODCAST = "NEWSLETTER_PODCAST",
  MEMBER = "MEMBER",
}

export enum CheckStatus {
  UNCLAIMED = "UNCLAIMED",
  CASHED = "CASHED",
}

export type Signature = {
  address: string
  message: string
  signature: string
  timestamp: Date
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
  milestoneBreakdown: number[] // list of percentages, number of milestones implied by length
  signatures: (Signature & { approval: boolean })[]
  milestones: {
    amount: number
    status: CheckStatus
    fundingSignatures: Signature[]
    transactionHash?: string // set once check is cashed showing proof of payment
  }[]
  referral: {
    type: ReferralType
    value: string
  }
}

export type Proposal = {
  fundingAddress: string
  data: ProposalMetadata
  status: ProposalStatus
  // needs more work
}
