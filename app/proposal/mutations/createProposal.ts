import db from "db"
import * as z from "zod"
import { ProposalMetadata } from "../types"
import { ZodToken } from "app/types/token"

const CreateProposal = z.object({
  terminalId: z.number(),
  rfpId: z.string(),
  collaborators: z.array(z.string()),
  token: ZodToken,
  amount: z.string(),
  recipientAddress: z.string(),
  contentTitle: z.string(),
  contentBody: z.string(),
  signature: z.string(),
  signatureMessage: z.any(),
})

export default async function createProposal(input: z.infer<typeof CreateProposal>) {
  const params = CreateProposal.parse(input)

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

  const proposal = await db.proposal.create({
    data: {
      rfpId: params.rfpId,
      data: metadata,
      collaborators: {
        createMany: {
          data: params.collaborators.map((collaborator) => {
            return {
              address: collaborator,
              terminalId: params.terminalId,
            }
          }),
        },
      },
    },
  })
  return proposal
}
