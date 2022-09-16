import { Account } from "app/account/types"

export enum ProposalRoleType {
  AUTHOR = "AUTHOR",
  CONTRIBUTOR = "CONTRIBUTOR",
  CLIENT = "CLIENT",
}

export type ProposalRole = {
  id: string
  proposalId: string
  address: string
  role: ProposalRoleType
  account?: Account
}
