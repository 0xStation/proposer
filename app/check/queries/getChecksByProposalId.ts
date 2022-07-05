import db from "db"
import * as z from "zod"

const GetChecksByProposalId = z.object({
  proposalId: z.string(),
})

export default async function getChecksByProposalId(input: z.infer<typeof GetChecksByProposalId>) {
  const checks = await db.check.findMany({
    where: {
      proposalId: input.proposalId,
    },
  })

  return checks
}
