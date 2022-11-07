import { ProposalVersion as PrismaProposalVersion } from "@prisma/client"

export type ProposalVersion = PrismaProposalVersion & {
  data: ProposalVersionMetadata
}

export type ProposalVersionMetadata = {
  content: {
    title: string
    body?: string
  }
  proposalSignatureMessage?: any
  proposalHash?: string
}
