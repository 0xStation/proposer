import { RfpStatus } from "@prisma/client"
import { Signature } from "app/types"

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
