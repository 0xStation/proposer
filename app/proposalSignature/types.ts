import { ProposalSignature as PrismaProposalSignature } from "@prisma/client"

export type ProposalSignature = PrismaProposalSignature & {
  data: ProposalSignatureMetadata
}

export type ProposalSignatureMetadata = {
  message: any
  signature: string
  representingRoles: string[]
  proposalHash: string
  ipfsMetadata?: {
    hash: string
    ipfsPinSize: number
    timestamp: string
  }
}
