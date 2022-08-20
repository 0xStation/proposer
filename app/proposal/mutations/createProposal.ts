import db from "db"
import * as z from "zod"
import { FundingSenderType, Token } from "app/types"
import { ProposalMetadata } from "../types"
import { toChecksumAddress } from "app/core/utils/checksumAddress"

const CreateProposal = z.object({
  authorAddress: z.string(),
  terminalId: z.number(),
  rfpId: z.string(),
  token: Token,
  amount: z.string(),
  recipientAddress: z.string(),
  senderAddress: z.string().optional(),
  senderType: z
    .enum([FundingSenderType.CHECKBOOK, FundingSenderType.SAFE, FundingSenderType.WALLET])
    .optional(),
  contentTitle: z.string(),
  contentBody: z.string(),
  collaborators: z.array(z.string()),
  signature: z.string(),
  signatureMessage: z.any(),
})

export default async function createProposal(input: z.infer<typeof CreateProposal>) {
  if (parseFloat(input.amount) < 0) {
    throw new Error("amount must be greater or equal to zero.")
  }

  const metadata: ProposalMetadata = {
    signature: input.signature,
    signatureMessage: input.signatureMessage,
    content: {
      title: input.contentTitle,
      body: input.contentBody,
    },
    funding: {
      chainId: input.token.chainId,
      recipientAddress: toChecksumAddress(input.recipientAddress),
      token: toChecksumAddress(input.token.address),
      amount: input.amount,
      symbol: input.token.symbol,
      senderAddress: input.senderAddress ? toChecksumAddress(input.senderAddress) : undefined,
      senderType: input.senderType,
    },
  }

  const proposal = await db.proposal.create({
    data: {
      rfpId: input.rfpId,
      data: JSON.parse(JSON.stringify(metadata)),
      collaborators: {
        createMany: {
          data: input.collaborators.map((collaborator) => {
            return {
              address: collaborator,
              terminalId: input.terminalId,
            }
          }),
        },
      },
    },
  })

  return proposal
}
