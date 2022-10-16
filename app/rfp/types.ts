import { Rfp as PrismaRfp } from "@prisma/client"
import { Template } from "app/template/types"

export type Rfp = PrismaRfp & {
  data: RfpMetadata
}

export type RfpMetadata = {
  content: {
    title: string
    body: string
    oneLiner: string
  }
  template: Template
}
