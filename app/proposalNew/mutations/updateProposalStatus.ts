import db from "db"
import * as z from "zod"
import { Ctx } from "blitz"
import { ProposalNewStatus } from "../types"

const UpdateProposalStatus = z.object({
  status: z.enum([
    ProposalNewStatus.APPROVED,
    ProposalNewStatus.AWAITING_APPROVAL,
    ProposalNewStatus.COMPLETE,
    ProposalNewStatus.DRAFT,
  ]),
  proposalId: z.string(),
})

export default async function updateProposalStatus(
  input: z.infer<typeof UpdateProposalStatus>,
  ctx: Ctx
) {
  const params = UpdateProposalStatus.parse(input)

  const existingProposalNew = await db.proposalNew.findUnique({
    where: {
      id: params.proposalId,
    },
    include: {
      roles: true,
    },
  })

  if (!existingProposalNew) {
    console.error("cannot update the status of a proposal that does not exist")
    return null
  }

  ctx.session.$authorize(
    existingProposalNew.roles.map((role) => role.address),
    []
  )

  const proposalNew = await db.proposalNew.update({
    where: {
      id: params.proposalId,
    },
    data: {
      status: params.status,
    },
  })

  return proposalNew
}
