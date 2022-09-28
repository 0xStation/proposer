import { ProposalRole as PrismaProposalRole } from "@prisma/client"
import { Account } from "app/account/types"
import { ProposalSignature } from "app/proposalSignature/types"

export type ProposalRole = PrismaProposalRole & {
  account?: Account
}

export type ProposalRoleWithSignatures = ProposalRole & {
  signatures: ProposalSignature[]
}
