import { ProposalRole as PrismaProposalRole } from "@prisma/client"
import { Account } from "app/account/types"

export type ProposalRole = PrismaProposalRole & {
  account?: Account
}
