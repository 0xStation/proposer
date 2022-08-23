import db from "db"
import * as z from "zod"
import { ProposalMetadata } from "../types"
import { ZodToken } from "app/types/token"

const UpdateProposal = z.object({
  proposalId: z.string(),
  token: ZodToken,
  amount: z.string(),
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

  const metadata: ProposalMetadata = {
    content: {
      title: params.contentTitle,
      body: params.contentBody,
    },
    funding: {
      recipientAddress: params.recipientAddress,
      token: params.token,
      amount: params.amount,
    },
    signature: params.signature,
    signatureMessage: params.signatureMessage,
  }

  try {
    const proposal = await db.proposal.update({
      where: { id: params.proposalId },
      data: {
        data: metadata,
        // Update: we're changing collaborators on the proposal model
        // so ignoring them for now in the update mutation.
      },
    })
    return proposal
  } catch (err) {
    throw Error(`Error creating proposal, failed with error: ${err.message}`)
  }
}
