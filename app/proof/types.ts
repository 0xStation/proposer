import { Proof as PrismaProof } from "@prisma/client"
import { CheckSignature } from "app/checkSignature/types"

export type Proof = PrismaProof & {
  signature: CheckSignature
  data: ProofMetadata
}

export type ProofMetadata = {
  path: any[]
}
