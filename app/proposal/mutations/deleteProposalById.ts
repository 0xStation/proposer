import * as z from "zod"
import db, { ProposalRoleType } from "db"
import { Ctx } from "blitz"

const DeleteProposalById = z.object({
  proposalId: z.string(),
})

export default async function deleteProposalById(
  input: z.infer<typeof DeleteProposalById>,
  ctx: Ctx
) {
  const params = DeleteProposalById.parse(input)

  const proposal = await db.proposal.findUnique({
    where: {
      id: params.proposalId,
    },
    include: {
      roles: {
        include: { account: true },
      },
    },
  })

  const authorAddresses =
    proposal?.roles
      .filter((role) => role.type === ProposalRoleType.AUTHOR)
      .map((role) => role.account.address) || []

  ctx.session.$authorize(authorAddresses, [])

  await db.proposal.delete({
    where: {
      id: params.proposalId,
    },
  })

  return true
}
