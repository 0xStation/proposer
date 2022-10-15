import { Rfp as PrismaRfp } from "@prisma/client"

export type Rfp = PrismaRfp & {
  data: RfpMetadata
}

export type RfpMetadata = {
  content: {
    title: string
    body: string
    oneLiner: string
  }
}
