import db from "db"
import * as z from "zod"
import { Ctx } from "blitz"
import { ProposalRoleApprovalStatus, ProposalRoleType, ProposalStatus } from "@prisma/client"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { genProposalDigest } from "app/signatures/proposal"
import { Proposal } from "app/proposal/types"
import { getHash } from "app/signatures/utils"
import { ChangeParticipantType } from "app/proposalVersion/types"

const UpdateProposalContributors = z.object({
  proposalId: z.string(),
  roleType: z.enum([
    ProposalRoleType.CONTRIBUTOR,
    ProposalRoleType.CLIENT,
    ProposalRoleType.AUTHOR,
  ]),
  removeRoleIds: z.string().array().default([]),
  addAddresses: z.string().array().default([]),
  newPaymentRecipient: z.string().optional(),
  newPaymentSender: z.string().optional(),
  changeNotes: z.string().default(""),
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
    params.newPaymentRecipient &&
    !existingProposal.roles
      .filter((role) => !params.removeRoleIds.includes(role.id))
      .some((role) => addressesAreEqual(role.address, params.newPaymentRecipient)) &&
    !params.addAddresses.includes(params.newPaymentRecipient)
  ) {
    throw Error("cannot set new fund recipient to someone who is not on the proposal")
  }
  if (
    params.newPaymentSender &&
    !existingProposal.roles
      .filter((role) => !params.removeRoleIds.includes(role.id))
      .some((role) => addressesAreEqual(role.address, params.newPaymentSender)) &&
    !params.addAddresses.includes(params.newPaymentSender)
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
            participants: [
              ...params.addAddresses.map((address) => {
                return {
                  address,
                  roleType: params.roleType,
                  changeType: ChangeParticipantType.ADDED,
                }
              }),
              ...existingProposal.roles
                .filter((role) => params.removeRoleIds.includes(role.id))
                .map((role) => {
                  return {
                    address: role.address,
                    roleType: params.roleType,
                    changeType: ChangeParticipantType.REMOVED,
                  }
                }),
            ],
          },
        },
      },
    })
  })

  return res
}
