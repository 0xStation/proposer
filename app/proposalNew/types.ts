import { ProposalSignature, ProposalRole, ProposalType } from "@prisma/client"
import { ProposalMilestone } from "app/proposalMilestone/types"
import { ProposalPayment } from "app/proposalPayment/types"

export type ProposalNew = {
  id: string
  type: ProposalType
  timestamp: Date // needed for public verifiability of multisig representation
  roles: ProposalRole[]
  milestones: ProposalMilestone[]
  payments: ProposalPayment[]
  signatures: ProposalSignature[]
  data: ProposalNewMetadata
}

export type ProposalNewMetadata = {
  content: { title: string; body: string }
  digest?: Digest
  ipfsMetadata?: {
    hash: string
    ipfsPinSize: number
    timestamp: Date
  }
  // below not included in digest
}

// role: who is responsible for something in the agreement
// permissions: who can view and mutate the object
// read/write/comment/propose-changes

// enables public verifiability of REPUTATION
type Digest = {
  hash: string // hash of { domain, types, values } via EIP-712
  domain: { name: string; version: string }
  types: any[]
  // value defined by assembling `types` from metadata above
}

// cryptographic proofs from users for publicly verifiable REPUTATION
// a signature from a specific user on the proposals Digest
// default behavior is for signature to represent the self, but can optionally represent a Role
// note that to validate `representing`, the `timestamp` field from Proposal is required
export type Commitment = {
  address: string
  signature: string
  representing?: { address: string; validationType: ""; chainId?: number }
}
