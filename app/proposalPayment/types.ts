import { Token } from "app/token/types"

// core of EXECUTION utility
// defines payment details of an atomic transfer of fungible and non-fungible tokens
// enables transfers of multiple tokens to multiple addresses across time (milestones)
// amount and tokenId used depending on token type to support ERC20, ERC721, and ERC1155
export type ProposalPayment = {
  id: string
  milestoneIndex: number // value of 0 indicates upon proposal approval
  senderAddress: string
  recipientAddress: string
  amount?: number
  tokenId?: number
  transactionHash?: string // filled in after execution
  data: ProposalPaymentMetadata
}

export type ProposalPaymentMetadata = {
  token: Token
}
