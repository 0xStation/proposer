import db from "db"
import * as z from "zod"
import { Ctx } from "blitz"
import { ProposalRoleType, ProposalStatus } from "@prisma/client"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"

const UpdateProposalContributors = z.object({
  proposalId: z.string(),
  roleType: z.enum([
    ProposalRoleType.CONTRIBUTOR,
    ProposalRoleType.CLIENT,
    ProposalRoleType.AUTHOR,
  ]),
  removeRoleIds: z.string().array().default([]),
  addAddresses: z.string().array().default([]),
  newFundRecipient: z.string().optional(),
  newFundSender: z.string().optional(),
})

export default async function updateProposalContributors(
  input: z.infer<typeof UpdateProposalContributors>,
  ctx: Ctx
) {
  const params = UpdateProposalContributors.parse(input)

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
  }
  if (
    !params.removeRoleIds.every((roleId) =>
      existingProposal.roles.some((role) => role.id === roleId)
    )
  ) {
    throw Error("cannot remove roles that do not exist on this proposal")
  }
  if (
    !existingProposal.roles
      .filter((role) => params.removeRoleIds.includes(role.id))
      .every((role) => role.type === params.roleType)
  ) {
    throw Error("cannot edit multiple roles at once")
  }
  if (
    existingProposal.roles
      .filter((role) => role.type === params.roleType)
      .some((role) => params.addAddresses.includes(role.address))
  ) {
    throw Error("cannot add address for existing role")
  }
  // Validate payment changes
  if (
    params.newFundRecipient &&
    !existingProposal.roles
      .filter((role) => !params.removeRoleIds.includes(role.id))
      .some((role) => addressesAreEqual(role.address, params.newFundRecipient)) &&
    !params.addAddresses.includes(params.newFundRecipient)
  ) {
    throw Error("cannot set new fund recipient to someone who is not on the proposal")
  }
  if (
    params.newFundSender &&
    !existingProposal.roles
      .filter((role) => !params.removeRoleIds.includes(role.id))
      .some((role) => addressesAreEqual(role.address, params.newFundSender)) &&
    !params.addAddresses.includes(params.newFundSender)
  ) {
    throw Error("cannot set new fund sender to someone who is not on the proposal")
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

  if (params.newFundRecipient) {
    await db.proposalPayment.updateMany({
      where: { proposalId: params.proposalId },
      data: {
        recipientAddress: params.newFundRecipient,
      },
    })
  }
  if (params.newFundSender) {
    await db.proposalPayment.updateMany({
      where: { proposalId: params.proposalId },
      data: {
        senderAddress: params.newFundSender,
      },
    })
  }

  return res
}
