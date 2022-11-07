import { Rfp as PrismaRfp, ProposalTemplate as PrismaProposalTemplate } from "@prisma/client"
import { Account } from "app/account/types"
import { Token } from "app/token/types"

export type Rfp = PrismaRfp & {
  data: RfpMetadata
  account?: Account
  template?: PrismaProposalTemplate
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
