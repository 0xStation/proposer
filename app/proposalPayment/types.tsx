import { ProposalPayment as PrismaProposalPayment } from "@prisma/client"
import { Token } from "app/token/types"

// core of EXECUTION utility
// defines payment details of an atomic transfer of fungible and non-fungible tokens
// enables transfers of multiple tokens to multiple addresses across time (milestones)
// amount and tokenId used depending on token type to support ERC20, ERC721, and ERC1155
export type ProposalPayment = PrismaProposalPayment & {
  data: ProposalPaymentMetadata
}

// TS being extremely annoying and making me fight the compiler
// saying namespace not recognized if I try to import AddressType from prisma client
// like I usually would. Including these here just so it is typescript "flavored"
// but really this is just to satisfy the compiler and no better than hardcoding
// "SAFE" on line 29 (type: AddressType["SAFE"])
type AddressType = {
  WALLET: "WALLET"
  SAFE: "SAFE"
}

export type ProposalPaymentMetadata = {
  token: Token
  history: {
    status: ProposalPaymentStatus
    timestamp: Date
    transactionHash?: string
    multisigTransaction?: {
      type: AddressType
      address: string
      nonce: number
      safeTxHash: string
      transactionId: string
    }
  }[]
}

export enum ProposalPaymentStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  REJECTED = "REJECTED",
  QUEUED = "QUEUED",
}

export enum PaymentTerm {
  ON_AGREEMENT = "ON_AGREEMENT",
  AFTER_COMPLETION = "AFTER_COMPLETION",
  ADVANCE_PAYMENT = "ADVANCE_PAYMENT",
}
