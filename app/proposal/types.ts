import { AccountProposal } from "@prisma/client"
import { Account } from "app/account/types"
import { ProposalApproval } from "app/proposalApproval/types"
import { Check } from "@prisma/client"

export enum ProposalStatus {
  SUBMITTED = "SUBMITTED",
  IN_REVIEW = "IN REVIEW",
  APPROVED = "APPROVED",
}

export type ProposalMetadata = {
  content: {
    title: string
    body: string
  }
  funding: {
    recipientAddress: string
    token: string
    amount: number
  }
  startDate: Date
  endDate: Date
  milestonePercentages: number[] // list of percentages, number of milestones is length
  collaborators: { address: string; percent: number }[] // list of collaborator splits, number of collaborators is length
}

// for some reason, prisma autogenerated is not picking up account
type AccountProposalExtended = AccountProposal & {
  account?: Account
}

export type Proposal = {
  id: string
  status: ProposalStatus
  data: ProposalMetadata
  createdAt: Date
  collaborators: AccountProposalExtended[]
  approvals: ProposalApproval[]
  checks: Check[]
}
