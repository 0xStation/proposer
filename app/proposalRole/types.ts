import { ProposalRole as PrismaProposalRole } from "@prisma/client"
import { Account } from "app/account/types"
import { Signature } from "app/signatures/types"

export type ProposalRole = PrismaProposalRole & {
  account?: Account
}

export type ProposalRoleWithSignatures = ProposalRole & {
  signatures: Signature[]
}
