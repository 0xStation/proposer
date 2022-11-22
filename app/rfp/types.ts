import { Rfp as PrismaRfp, ProposalRoleType, RfpStatus } from "@prisma/client"
import { Account } from "app/account/types"
import { PaymentTerm } from "app/proposalPayment/types"
import { ProposalTemplate } from "app/template/types"
import { Token } from "app/token/types"

export type Rfp = PrismaRfp & {
  data: RfpMetadata
  account?: Account
  template?: ProposalTemplate
  _count?: { proposals: number }
}

export type RfpMetadata = {
  content: {
    title: string
    body: string
    oneLiner: string
    submissionGuideline: string
  }
  singleTokenGate: {
    token: Token
    minBalance?: string // string to pass directly into BigNumber.from in logic check
  }
  requiredSocialConnections: string[]
  proposal: {
    requesterRole: ProposalRoleType
    proposerRole: ProposalRoleType
    body: {
      prefill?: string
      minWordCount?: number
    }
    payment: {
      token?: Token
      minAmount?: number
      maxAmount?: number
      terms?: PaymentTerm
      advancePaymentPercentage?: number
    }
  }
}

export enum PaymentDirection {
  AUTHOR_IS_RECIPIENT = "AUTHOR_IS_RECIPIENT",
  AUTHOR_IS_SENDER = "AUTHOR_IS_SENDER",
}

export enum SocialConnection {
  DISCORD = "DISCORD",
  TWITTER = "TWITTER",
  GITHUB = "GITHUB",
  FARCASTER = "FARCASTER",
  LENS = "LENS",
}

export enum PaymentAmountType {
  FLEXIBLE = "FLEXIBLE",
  FIXED = "FIXED",
  MINIMUM = "MINIMUM",
  MAXIMUM = "MAXIMUM",
  RANGE = "RANGE",
}

export enum RfpProductStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}
