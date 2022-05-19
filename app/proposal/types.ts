import { Account, AccountProposalType, ProposalState } from "@prisma/client"

export enum PaymentTerms {
  AFTER_COMPLETION = "After completion",
  UPFRONT = "Upfront",
}

export enum FundingCurrency {
  GAS = "GAS", // if selected, use a mapping to go from chainId to proper gas token (e.g. MATIC for Polygon)
  ERC20 = "ERC20",
}

export enum FundingType {
  DIRECT_TRANSFER = "Direct transfer", // send tokens/ETH directly between two addresses
}

// mapping of chainId to gas token, add more over time
// still tbd when to support multichain because it's really easy to while we don't have our own contracts
export const chainGasTokens = {
  1: "ETH", // ethereum mainnet
  4: "ETH", // rinkeby testnet
  137: "MATIC", // polygon mainnet
}

export type ProposalDeliverable = {
  title: string
  description?: string
  url?: string
}

export type AccountProposal = {
  account: Account
  type: AccountProposalType
}

export type ProposalSignature = {
  id?: number
  signingAddress: string
  representingAddress?: string
  createdAt: string
  message: string
  signature: string
}

// going to try structure outlined in "Proposal Data Models" Notion doc after getting a v1 of these models out there.
// first goal is to make an intuitive data model for current scope and then iterate for abstractions
export type ProposalMetadata = {
  funding: {
    type: FundingType
    source: string
    destination: string
    paymentTerms: PaymentTerms
    value: number // need to remember to use decimals of token when queueing transaction
    currency: {
      chainId: number
      type: FundingCurrency
      symbol: string
      address?: string // only use if ERC20 token
    }
  }
  startDate: number // unix timestamp
  endDate: number // unix timestamp
  deliverables: ProposalDeliverable[]
}

export type Proposal = {
  id: number
  terminalId?: number
  authorAddress: string
  createdAt: string
  updatedAt: string
  data: ProposalMetadata
  state: ProposalState
  accounts: AccountProposal[]
  signatures: ProposalSignature[]
}
