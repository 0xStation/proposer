import { Signature } from "app/types"

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
  parentMultisig: string
  fundingAddress: string
  localId: number
  authorAddress: string
  startDate: Date
  endDate?: Date
  status: RfpStatus
  data: RfpMetadata
}
