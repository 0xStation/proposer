import { ProposalSignature } from "@prisma/client"
import { ProposalRole } from "app/proposalRole/types"
import { ProposalMilestone } from "app/proposalMilestone/types"
import { PaymentTerm, ProposalPayment } from "app/proposalPayment/types"
import { Token } from "app/token/types"
import { Proposal as PrismaProposal } from "@prisma/client"

export type Proposal = PrismaProposal & {
  data: ProposalMetadata
  roles?: ProposalRole[]
  milestones?: ProposalMilestone[]
  payments?: ProposalPayment[]
  signatures?: ProposalSignature[]
}

export type ProposalMetadata = {
  content: { title: string; body: string }
  digest?: Digest
  ipfsMetadata?: {
    hash: string
    ipfsPinSize: number
    timestamp: string
  }
  // cache total payment amounts for rendering on list components and primary metadata view
  totalPayments?: { token: Token; amount: number }[]
  paymentTerms?: PaymentTerm
  advancePaymentPercentage?: number
  // record keeping for proposal sending signature and versioning
  authorAddress?: string
  authorSignature?: string
  signatureMessage?: any
  proposalHash?: string
}

// enables public verifiability of REPUTATION
type Digest = {
  hash: string // hash of { domain, types, values } via EIP-712
  domain: { name: string; version: string }
  types: any[]
  // value defined by assembling `types` from metadata above
}
