import { Rfp as PrismaRfp } from "@prisma/client"
import { Template } from "app/template/types"
import { Token } from "app/token/types"

export type Rfp = PrismaRfp & {
  data: RfpMetadata
}

export type RfpMetadata = {
  content: {
    title: string
    body: string
    oneLiner: string
    submissionGuideline?: string
  }
  template: Template
  singleTokenGate: {
    token: Token
    minBalance?: string // string to throw directly into BigNumber.from in logic check
  }
}
