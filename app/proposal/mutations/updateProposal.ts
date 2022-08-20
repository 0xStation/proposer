import db from "db"
import * as z from "zod"
import { ProposalMetadata } from "../types"

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
  const params = UpdateProposal.parse(input)
  if (parseFloat(params.amount) < 0) {
    throw new Error("amount must be greater or equal to zero.")
  }

  const proposalMetadata = {
    signature: params.signature,
    signatureMessage: params.signatureMessage,
    content: {
      title: params.contentTitle,
      body: params.contentBody,
    },
    funding: {
      recipientAddress: params.recipientAddress,
      token: params.token,
      amount: params.amount,
      symbol: params.symbol,
    },
  } as ProposalMetadata

  try {
    const proposal = await db.proposal.update({
      where: { id: params.proposalId },
      data: {
        data: proposalMetadata,
        // Update: we're changing collaborators on the proposal model
        // so ignoring them for now in the update mutation.
      },
    })
    return proposal
  } catch (err) {
    throw Error(`Error creating proposal, failed with error: ${err.message}`)
  }
}
