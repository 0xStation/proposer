import { ProposalPayment as PrismaProposalPayment } from "@prisma/client"
import { Token } from "app/token/types"

// core of EXECUTION utility
// defines payment details of an atomic transfer of fungible and non-fungible tokens
// enables transfers of multiple tokens to multiple addresses across time (milestones)
// amount and tokenId used depending on token type to support ERC20, ERC721, and ERC1155
export type ProposalPayment = PrismaProposalPayment & {
  data: ProposalPaymentMetadata
}

export type ProposalPaymentMetadata = {
  token: Token
  gnosis?: {
    safeAddress: string
    txId: string
  }
}

export enum PaymentTerm {
  ON_AGREEMENT = "ON_AGREEMENT",
  AFTER_COMPLETION = "AFTER_COMPLETION",
}
