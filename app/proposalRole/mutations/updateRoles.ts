import db from "db"
import * as z from "zod"
import { Ctx } from "blitz"
import { ProposalRoleApprovalStatus, ProposalRoleType, ProposalStatus } from "@prisma/client"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { genProposalDigest } from "app/signatures/proposal"
import { Proposal } from "app/proposal/types"
import { getHash } from "app/signatures/utils"
import { ChangeParticipantType } from "app/proposalVersion/types"

const UpdateRoles = z.object({
  proposalId: z.string(),
  removeRoleIds: z.string().array().default([]),
  addRoles: z
    .object({
      type: z.enum([
        ProposalRoleType.CONTRIBUTOR,
        ProposalRoleType.CLIENT,
        ProposalRoleType.AUTHOR,
      ]),
      address: z.string(),
    })
    .array(),
  newPaymentRecipient: z.string().optional(),
  newPaymentSender: z.string().optional(),
  changeNotes: z.string().default(""),
})

export default async function updateRoles(input: z.infer<typeof UpdateRoles>, ctx: Ctx) {
  const params = UpdateRoles.parse(input)

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

  const removeRoles = existingProposal.roles.filter((role) =>
    params.removeRoleIds.includes(role.id)
  )

  if (
    !params.removeRoleIds.every((roleId) =>
      existingProposal.roles.some((role) => role.id === roleId)
    )
  ) {
    throw Error("cannot remove roles that do not exist on this proposal")
  }
  if (
    params.addRoles.some((newRole) =>
      existingProposal.roles.some(
        (existingRole) =>
          newRole.type === existingRole.type &&
          addressesAreEqual(newRole.address, existingRole.address)
      )
    )
  ) {
    throw Error("cannot add role that already exists")
  }
  // Validate payment changes
  if (
    params.newPaymentRecipient &&
    !existingProposal.roles
      .filter((role) => !params.removeRoleIds.includes(role.id))
      .some((role) => addressesAreEqual(role.address, params.newPaymentRecipient)) &&
    !params.addRoles.some(
      (role) =>
        role.type === ProposalRoleType.CONTRIBUTOR &&
        addressesAreEqual(role.address, params.newPaymentRecipient)
    )
  ) {
    throw Error("cannot set new fund recipient to someone who is not on the proposal")
  }
  if (
    params.newPaymentSender &&
    !existingProposal.roles
      .filter((role) => !params.removeRoleIds.includes(role.id))
      .some((role) => addressesAreEqual(role.address, params.newPaymentSender)) &&
    !params.addRoles.some(
      (role) =>
        role.type === ProposalRoleType.CLIENT &&
        addressesAreEqual(role.address, params.newPaymentSender)
    )
  ) {
    throw Error("cannot set new fund sender to someone who is not on the proposal")
  }

  const editingRoles = [
    ...removeRoles.map((role) => role.type),
    params.addRoles.map((role) => role.type),
  ].filter((v, i, addresses) => addresses.indexOf(v) === i) // unique role types

  let authorizedAddresses
  // can only edit both clients and contributors if user is author
  if (
    editingRoles.includes(ProposalRoleType.CLIENT) &&
    editingRoles.includes(ProposalRoleType.CONTRIBUTOR)
  ) {
    authorizedAddresses = existingProposal.roles
      .filter((role) => role.type === ProposalRoleType.AUTHOR)
      .map((role) => role.address)
  } else {
    authorizedAddresses = existingProposal.roles
      .filter((role) => editingRoles.includes(role.type) || role.type === ProposalRoleType.AUTHOR)
      .map((role) => role.address)
  }

  ctx.session.$authorize(authorizedAddresses, [])

  const res = await db.$transaction([
    ...params.addRoles.map((role) =>
      db.proposalRole.create({
        data: {
          proposalId: params.proposalId,
          type: role.type,
          address: role.address,
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
    db.proposalRole.updateMany({
      where: {
        proposalId: params.proposalId as string,
      },
      data: {
        approvalStatus: ProposalRoleApprovalStatus.PENDING,
      },
    }),
  ])

  if (params.newPaymentRecipient) {
    await db.proposalPayment.updateMany({
      where: { proposalId: params.proposalId },
      data: {
        recipientAddress: params.newPaymentRecipient,
      },
    })
  }
  if (params.newPaymentSender) {
    await db.proposalPayment.updateMany({
      where: { proposalId: params.proposalId },
      data: {
        senderAddress: params.newPaymentSender,
      },
    })
  }

  const res2 = await db.$transaction(async (db) => {
    const newProposalVersion = existingProposal.version + 1

    const proposal = (await db.proposal.update({
      where: { id: params.proposalId },
      data: {
        version: newProposalVersion,
      },
      include: {
        roles: true,
        milestones: true,
        payments: true,
      },
    })) as Proposal

    const message = genProposalDigest(proposal)
    const { domain, types, value } = message
    const proposalHash = getHash(domain, types, value)

    const newVersion = await db.proposalVersion.create({
      data: {
        proposalId: params.proposalId,
        version: newProposalVersion,
        editorAddress: ctx?.session?.siwe?.address as string,
        data: {
          content: {
            title: `Version ${newProposalVersion}`,
            body: params.changeNotes,
          },
          proposalSignatureMessage: message,
          proposalHash: proposalHash,
          changes: {
            participants: {
              diff: [
                ...params.addRoles.map((role) => {
                  return {
                    address: role.address,
                    roleType: role.type,
                    changeType: ChangeParticipantType.ADDED,
                  }
                }),
                ...existingProposal.roles
                  .filter((role) => params.removeRoleIds.includes(role.id))
                  .map((role) => {
                    return {
                      address: role.address,
                      roleType: role.type,
                      changeType: ChangeParticipantType.REMOVED,
                    }
                  }),
              ],
            },
          },
        },
      },
    })
  })

  return res
}
