import db from "db"
import * as z from "zod"
import { Ctx } from "blitz"
import { ProposalRoleType, ProposalStatus } from "@prisma/client"

const UpdateProposalRoles = z.object({
  proposalId: z.string(),
  roleType: z.enum([
    ProposalRoleType.AUTHOR,
    ProposalRoleType.CONTRIBUTOR,
    ProposalRoleType.CLIENT,
  ]),
  removeRoleIds: z.string().array().default([]),
  addAddresses: z.string().array().default([]),
})

export default async function updateProposalRoles(
  input: z.infer<typeof UpdateProposalRoles>,
  ctx: Ctx
) {
  const params = UpdateProposalRoles.parse(input)

  const existingProposal = await db.proposal.findUnique({
    where: {
      id: params.proposalId,
    },
    include: {
      roles: true,
    },
  })

  if (!existingProposal) {
    throw Error("cannot update the roles of a proposal that does not exist")
    return null
  }
  if (
    !params.removeRoleIds.every((roleId) =>
      existingProposal.roles.some((role) => role.id === roleId)
    )
  ) {
    throw Error("cannot remove roles that do not exist on this proposal")
    return null
  }
  if (
    !existingProposal.roles
      .filter((role) => params.removeRoleIds.includes(role.id))
      .every((role) => role.type === params.roleType)
  ) {
    throw Error("cannot edit multiple roles at once")
    return null
  }
  if (
    existingProposal.roles
      .filter((role) => role.type === params.roleType)
      .some((role) => params.addAddresses.includes(role.address))
  ) {
    throw Error("cannot add address for existing role")
    return null
  }

  ctx.session.$authorize(
    existingProposal.roles
      .filter((role) => role.type === params.roleType || role.type === ProposalRoleType.AUTHOR)
      .map((role) => role.address),
    []
  )

  const res = await db.$transaction([
    ...params.addAddresses.map((address) =>
      db.proposalRole.create({
        data: {
          proposalId: params.proposalId,
          type: params.roleType,
          address,
        },
      })
    ),
    ...params.removeRoleIds.map((roleId) =>
      db.proposalRole.delete({
        where: {
          id: roleId,
        },
      })
    ),
  ])

  return res
}
