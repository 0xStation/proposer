import { RfpStatus } from "@prisma/client"

export type RfpMetadata = {
  content: {
    title: string
    body: string
  }
  publishSignature: {
    address: string
    message: string
    signature: string
    timestamp: Date
  }
  submissionPrefill: {
    body: string
  }
}

export type Rfp = {
  fundingAddress: string
  localId: number
  authorAddress: string
  startDate: Date
  endDate: Date
  status: RfpStatus
  data: RfpMetadata
}
