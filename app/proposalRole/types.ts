import { ProposalRoleType } from "@prisma/client"
import { Account } from "app/account/types"

export type ProposalRole = {
  address: string
  role: ProposalRoleType
  account?: Account & { quorum?: number; signers?: string[] }
}
