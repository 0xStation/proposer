import db from "db"
import * as z from "zod"
import { ProposalStatus as PrismaProposalStatus } from "@prisma/client"

// sets status to "DELETED" -- DOES NOT ACTUALLY DELETE FROM DB
const DeleteProposal = z.object({
  proposalId: z.string(),
})

export default async function deleteProposal(input: z.infer<typeof DeleteProposal>) {
  const params = DeleteProposal.parse(input)
  try {
    const proposal = await db.proposal.update({
      where: { id: params.proposalId },
      data: {
        status: PrismaProposalStatus.DELETED,
      },
    })

    return proposal
  } catch (error) {
    throw error
  }
}
