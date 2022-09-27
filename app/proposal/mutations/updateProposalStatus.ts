import db from "db"
import * as z from "zod"
import { Ctx } from "blitz"
import { ProposalStatus } from "@prisma/client"

const UpdateProposalStatus = z.object({
  status: z.enum([
    ProposalStatus.APPROVED,
    ProposalStatus.AWAITING_APPROVAL,
    ProposalStatus.COMPLETE,
    ProposalStatus.DRAFT,
  ]),
  proposalId: z.string(),
})

export default async function updateProposalStatus(
  input: z.infer<typeof UpdateProposalStatus>,
  ctx: Ctx
) {
  const params = UpdateProposalStatus.parse(input)

  const existingProposal = await db.proposal.findUnique({
    where: {
      id: params.proposalId,
    },
    include: {
      roles: true,
    },
  })

  if (!existingProposal) {
    console.error("cannot update the status of a proposal that does not exist")
    return null
  }

  ctx.session.$authorize(
    existingProposal.roles.map((role) => role.address),
    []
  )

  const proposal = await db.proposal.update({
    where: {
      id: params.proposalId,
    },
    data: {
      status: params.status,
    },
  })

  return proposal
}
