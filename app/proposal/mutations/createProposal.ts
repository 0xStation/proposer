import db from "db"
import * as z from "zod"

const CreateProposal = z.object({
  rfpId: z.string(),
  token: z.string(),
  amount: z.number(),
  recipientAddress: z.string(),
  contentTitle: z.string(),
  contentBody: z.string(),
  startDate: z.date(),
  endDate: z.date(),

  contributors: z.array(z.string()).optional(), // for now == moving this to p1+
})

// not making use of start date and end date for now...
export default async function createProposal(input: z.infer<typeof CreateProposal>) {
  const proposal = await db.proposal.create({
    data: {
      rfpId: input.rfpId,
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
    },
  })
  return proposal
}
