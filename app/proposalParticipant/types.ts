import { ProposalParticipant as PrismaProposalParticipant, ProposalSignature } from "@prisma/client"
import { Account } from "app/account/types"

export type ProposalParticipant = PrismaProposalParticipant & {
  data: ProposalParticipantMetadata
  account?: Account
  signatures?: ProposalSignature[]
}

export type ProposalParticipantMetadata = {}
