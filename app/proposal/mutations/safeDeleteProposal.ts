import db from "db"
import * as z from "zod"
import { Ctx } from "blitz"
import { ProposalRoleType, ProposalStatus } from "@prisma/client"

const SafeDeleteProposal = z.object({
  proposalId: z.string(),
})

// Safe delete: marks proposal's `deleted` column as true and does not remove from database
export default async function safeDeleteProposal(
  input: z.infer<typeof SafeDeleteProposal>,
  ctx: Ctx
) {
  const { proposalId } = SafeDeleteProposal.parse(input)

  const existingProposal = await db.proposal.findUnique({
    where: {
      id: proposalId,
    },
    include: {
      roles: true,
    },
  })

  if (!existingProposal) {
    console.error("cannot delete a proposal that does not exist")
    return null
  } else if (existingProposal.deleted) {
    console.error("proposal is already deleted")
    return null
  }

  ctx.session.$authorize(
    existingProposal.roles
      .filter((role) => role.type === ProposalRoleType.AUTHOR)
      .map((role) => role.address),
    []
  )

  const proposal = await db.proposal.update({
    where: {
      id: proposalId,
    },
    data: {
      deleted: true,
    },
  })

  return proposal
}
