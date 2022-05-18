import db from "db"
import * as z from "zod"
import { Proposal } from "../types"

// feel like its easier to flatten to one object than nest more zod objects
const CreateProposalMetadata = z.object({
  startDate: z.number().optional(),
  endDate: z.number().optional(),
  fundingType: z.string().optional(),
  fundingSource: z.string().optional(),
  fundingDestination: z.string().optional(),
  fundingPaymentTerms: z.string().optional(),
  fundingValue: z.number().optional(),
  fundingCurrencyChainId: z.number().optional(),
  fundingCurrencyType: z.string().optional(),
  fundingCurrencySymbol: z.string().optional(),
  fundingCurrencyAddress: z.string().optional(),
  deliverables: z.string().array(),
})

const CreateProposal = z.object({
  authorAddress: z.string(),
  terminalId: z.number().optional(),
  data: CreateProposalMetadata,
})

export default async function createTerminal(input: z.infer<typeof CreateProposal>) {
  const params = CreateProposal.parse(input)

  const payload = {
    authorAddress: params.authorAddress,
    terminalId: params.terminalId,
    data: {
      funding: {
        type: params.data.fundingType,
        source: params.data.fundingSource,
        destination: params.data.fundingDestination,
        paymentTerms: params.data.fundingPaymentTerms,
        value: params.data.fundingValue,
        currency: {
          chainId: params.data.fundingCurrencyChainId,
          type: params.data.fundingCurrencyType,
          symbol: params.data.fundingCurrencySymbol,
          address: params.data.fundingCurrencyAddress,
        },
      },
      startDate: params.data.startDate,
      endDate: params.data.endDate,
      deliverables: params.data.deliverables,
    },
  }

  try {
    const proposal = (await db.proposal.create({ data: payload })) as unknown as Proposal
    return proposal
  } catch (err) {
    throw err
  }
}
