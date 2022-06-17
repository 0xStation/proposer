import { Account } from "app/account/types"
import { Checkbook } from "app/checkbook/types"
import { Signature } from "app/types"

// note that these statuses are different than those in the database enum
// our RFP queries/mutations translate between the two via functions in ./utils.ts
export enum RfpStatus {
  DRAFT = "DRAFT",
  STARTING_SOON = "STARTING_SOON",
  OPEN_FOR_SUBMISSIONS = "OPEN_FOR_SUBMISSIONS",
  CLOSED = "CLOSED",
  ARCHIVED = "ARCHIVED",
}

export type RfpMetadata = {
  content: {
    title: string
    body: string
  }
  publishSignature: Signature
  // prefill all proposals to this RFP with this configuration
  proposalPrefill: {
    body: string // template body for customized inclusion + addition of questions
  }
}

export type Rfp = {
  id: string
  fundingAddress: string
  authorAddress: string
  startDate: Date
  endDate?: Date
  status: RfpStatus
  data: RfpMetadata
  submissionCount: number
  author?: Account
  checkbook: Checkbook
}
