import db from "db"
import * as z from "zod"

const CreateProposal = z.object({
  terminalId: z.number(),
  rfpId: z.string(),
  token: z.string(),
  amount: z.number(),
  recipientAddress: z.string(),
  contentTitle: z.string(),
  contentBody: z.string(),
  collaborators: z.array(z.string()),
})

export default async function createProposal(input: z.infer<typeof CreateProposal>) {
  const proposal = await db.proposal.create({
    data: {
      rfpId: input.rfpId,
      terminalId: input.terminalId,
      data: {
        content: {
          title: input.contentTitle,
          body: input.contentBody,
        },
        funding: {
          recipientAddress: input.recipientAddress,
          token: input.token,
          amount: input.amount,
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
