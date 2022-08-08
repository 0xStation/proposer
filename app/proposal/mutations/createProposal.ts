import db from "db"
import * as z from "zod"
import { Token } from "app/types"
import { ProposalMetadata } from "../types"

const CreateProposal = z.object({
  authorAddress: z.string(),
  terminalId: z.number(),
  rfpId: z.string(),
  token: Token,
  amount: z.string(),
  recipientAddress: z.string(),
  contentTitle: z.string(),
  contentBody: z.string(),
  collaborators: z.array(z.string()),
  signature: z.string(),
  signatureMessage: z.any(),
})

export default async function createProposal(input: z.infer<typeof CreateProposal>) {
  const amount = parseFloat(input.amount)
  if (amount < 0) {
    throw new Error("amount must be greater or equal to zero.")
  }

  const metadata: ProposalMetadata = {
    publishSignature: {
      signature: input.signature,
      message: input.signatureMessage,
      address: input.authorAddress,
      timestamp: new Date(),
    },
    content: {
      title: input.contentTitle,
      body: input.contentBody,
    },
    funding: {
      chainId: input.token.chainId,
      recipientAddress: input.recipientAddress,
      token: input.token.address,
      amount,
      symbol: input.token.symbol,
      // senderAddress left for proposal recipient to decide
      // senderType left for proposal recipient to decide
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

  console.log(proposal)

  return proposal
}
