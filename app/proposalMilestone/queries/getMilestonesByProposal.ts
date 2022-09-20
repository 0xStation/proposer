import db from "db"
import * as z from "zod"
import { ProposalMilestone } from "../types"

const GetMilestonesByProposal = z.object({
  proposalId: z.string(),
})

export default async function getMilestonesByProposal(
  params: z.infer<typeof GetMilestonesByProposal>
) {
  const milestones = await db.proposalMilestone.findMany({
    where: {
      proposalId: params.proposalId,
    },
    include: {
      payments: true,
    },
    orderBy: {
      index: "asc", // sort from first to last index
    },
  })

  return milestones as unknown as ProposalMilestone[]
}
