import db from "db"
import * as z from "zod"

const UpdateProposal = z.object({
  proposalId: z.string(),
  token: z.string(),
  amount: z.string(),
  symbol: z.string().optional(),
  recipientAddress: z.string(),
  contentTitle: z.string(),
  contentBody: z.string(),
  signature: z.string(),
  signatureMessage: z.any(),
})

export default async function updateProposal(input: z.infer<typeof UpdateProposal>) {
  if (parseFloat(input.amount) < 0) {
    throw new Error("amount must be greater or equal to zero.")
  }

  try {
    const proposal = await db.proposal.update({
      where: { id: input.proposalId },
      data: {
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
        // Update: we're changing collaborators on the proposal model
        // so ignoring them for now in the update mutation.
      },
    })
    return proposal
  } catch (err) {
    throw Error(`Error creating proposal, failed with error: ${err.message}`)
  }
}
