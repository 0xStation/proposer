export type ProposalNewMetadata = {
  content: { title: string; body: string }
  payments?: Payment[]
  milestones?: Milestone[]
  digest: Digest
  // below not included in digest
  commitments: Commitment[]
}

export type ProposalNew = {
  id: string
  type: ProposalType
  timestamp: Date // needed for public verifiability of multisig representation
  data: ProposalNewMetadata
  roles: Role[]
}

export enum RoleType {
  AUTHOR = "AUTHOR",
  CONTRIBUTOR = "CONTRIBUTOR",
  CLIENT = "CLIENT",
}

export enum ProposalStatus {
  DRAFT = "DRAFT",
  CONSENTED = "CONSENTED",
  COMPLETE = "COMPLETE",
  INCOMPLETE = "INCOMPLETE",
}

export enum ProposalType {
  FUNDING = "FUNDING",
}

export type Role = {
  address: string
  role: RoleType
}

// role: who is responsible for something in the agreement
// permissions: who can view and mutate the object
// read/write/comment/propose-changes

// core of EXECUTION utility
// defines payment details of an atomic transfer of fungible and non-fungible tokens
// enables transfers of multiple tokens to multiple addresses across time (milestones)
// amount and tokenId used depending on token type to support ERC20, ERC721, and ERC1155
export type Payment = {
  milestoneId: number // value of 0 indicates upon proposal approval
  recipientAddress: string
  token: Token
  amount?: string
  tokenId?: number
  transactionHash?: string // filled in after execution
}

// addition to EXECUTION utility
// enriches application with metadata and mechanisms for acceptance critera and reviewers
export type Milestone = {
  id: number // also used to imply ordering
  title: string
  // missing something on acceptance criteria, reviewers, etc.
}

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

// convenience metadata for application consumption, metadata is verifiable on-chain
export type Token = {
  chainId: number
  address: string
  type?: TokenType
  name?: string
  symbol?: string
  decimals?: number
}

export enum TokenType {
  COIN = "COIN",
  ERC20 = "ERC20",
  ERC721 = "ERC721",
  ERC1155 = "ERC1155",
}
