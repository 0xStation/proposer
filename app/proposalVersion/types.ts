import { ProposalRoleType, ProposalVersion as PrismaProposalVersion } from "@prisma/client"

export type ProposalVersion = PrismaProposalVersion & {
  data: ProposalVersionMetadata
}

export type ProposalVersionMetadata = {
  content: {
    title: string
    body?: string
  }
  proposalSignatureMessage: any
  proposalHash: string
  changes?: {
    participants?: {
      address: string
      roleType: ProposalRoleType
      changeType: ChangeParticipantType
    }[]
  }
}

export enum ChangeParticipantType {
  ADDED = "ADDED",
  REMOVED = "REMOVED",
}
