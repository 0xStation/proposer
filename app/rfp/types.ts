import { Rfp as PrismaRfp, RfpStatus } from "@prisma/client"
import { Account } from "app/account/types"
import { Template } from "app/template/types"
import { Token } from "app/token/types"

export type Rfp = PrismaRfp & {
  data: RfpMetadata
  account?: Account
  template?: Template
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
    minBalance?: string // string to pass directly into BigNumber.from in logic check
  }
}
