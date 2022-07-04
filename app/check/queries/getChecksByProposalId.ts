import db from "db"
import * as z from "zod"
import { Check } from "app/check/types"

const GetChecksByProposalId = z.object({
  proposalId: z.string(),
})

export default async function getChecksByProposalId(input: z.infer<typeof GetChecksByProposalId>) {
  const checks = await db.check.findMany({
    where: {
      proposalId: input.proposalId,
    },
    include: {
      recipientAccount: true,
      approvals: true,
      checkbook: true,
    },
    orderBy: {
      nonce: "desc",
    },
  })

  return checks as Check[]
}
