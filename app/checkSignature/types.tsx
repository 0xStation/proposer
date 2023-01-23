import { CheckSignature as PrismaCheckSignature } from "@prisma/client"

export type CheckSignature = PrismaCheckSignature & {
  data: CheckSignatureMetadata
}

export type CheckSignatureMetadata = {
  message: {
    domain: any
    types: any
    values: any
  }
  signature: string
}
