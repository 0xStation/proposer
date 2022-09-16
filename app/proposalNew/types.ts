import { ProposalSignature, ProposalRole, ProposalType } from "@prisma/client"
import { ProposalMilestone } from "app/proposalMilestone/types"
import { PaymentTerm, ProposalPayment } from "app/proposalPayment/types"
import { Token } from "app/token/types"
import { ProposalNewStatus } from "@prisma/client"

export type ProposalNew = {
  id: string
  type: ProposalType
  timestamp: Date // needed for public verifiability of multisig representation
  roles: ProposalRole[]
  milestones: ProposalMilestone[]
  payments: ProposalPayment[]
  signatures: ProposalSignature[]
  data: ProposalNewMetadata
  status: ProposalNewStatus
  startDate: Date
  endDate: Date
}

export type ProposalNewMetadata = {
  content: { title: string; body: string }
  digest?: Digest
  ipfsMetadata?: {
    hash: string
    ipfsPinSize: number
    timestamp: string
  }
  // cache total payment amounts for rendering on list components and primary metadata view
  totalPayments: { token: Token; amount: number }[]
  paymentTerms: PaymentTerm
}

// enables public verifiability of REPUTATION
type Digest = {
  hash: string // hash of { domain, types, values } via EIP-712
  domain: { name: string; version: string }
  types: any[]
  // value defined by assembling `types` from metadata above
}
