import { ProposalVersion as PrismaProposalVersion } from "@prisma/client"
import { PaymentTerm } from "app/proposalPayment/types"
import { Token } from "app/token/types"

export type ProposalVersion = PrismaProposalVersion & {
  data: ProposalVersionMetadata
}

export type ProposalVersionMetadata = {
  content: {
    title: string
    body?: string
  }
  proposalSignatureMessage: any
  proposalHash: string
  changes: {
    payments?: {
      before: {
        recipientAddress: string
        senderAddress: string
        amount: string
        token: Token
        paymentTerms: PaymentTerm
        advancePaymentPercentage: string
      }
      after: {
        recipientAddress: string
        senderAddress: string
        amount: string
        token: Token
        paymentTerms: PaymentTerm
        advancePaymentPercentage: string
      }
    }[]
  }
}
