import db from "db"
import * as z from "zod"
import { BigNumber } from "ethers"

const CreateProposal = z.object({
  terminalId: z.number(),
  rfpId: z.string(),
  token: z.string(),
  amount: z.string(),
  symbol: z.string().optional(),
  recipientAddress: z.string(),
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

  const proposal = await db.proposal.create({
    data: {
      rfpId: input.rfpId,
      data: {
        signature: input.signature,
        signatureMessage: input.signatureMessage,
        content: {
          title: input.contentTitle,
          body: input.contentBody,
        },
        funding: {
          recipientAddress: input.recipientAddress,
          token: input.token,
          amount: input.amount,
          symbol: input.symbol,
        },
      },
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
