import db from "db"
import * as z from "zod"

const CreateProposal = z.object({
  terminalId: z.number(),
  rfpId: z.string(),
  fundingAddress: z.string(),
  contentTitle: z.string(),
  contentBody: z.string(),
  contributors: z.array(z.string()),
})

export default async function createProposal(input: z.infer<typeof CreateProposal>) {
  // const proposal = await db.proposal.create({
  //   data: {
  //     rfpId: input.rfpId,
  //     data: {
  //       content: {
  //         title: input.contentTitle,
  //         body: input.contentBody,
  //       },
  //     },
  //   },
  // })
  // return proposal
}
