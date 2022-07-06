import db from "db"
import * as z from "zod"
import { Check } from "../types"

const GetChecksByProposalId = z.object({
  proposalId: z.string(),
})

export default async function getChecksByProposalId(input: z.infer<typeof GetChecksByProposalId>) {
  try {
    const checks = await db.check.findMany({
      where: {
        proposalId: input.proposalId,
      },
      include: {
        recipientAccount: true,
        approvals: true,
      },
    })
    return checks as Check[]
  } catch (err) {
    console.error("Failed to retrieve checks by proposal id:", err)
    return []
  }
}
