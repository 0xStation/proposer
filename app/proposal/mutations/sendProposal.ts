import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { ProposalRoleApprovalStatus, ProposalRoleType, ProposalSignatureType } from "@prisma/client"
import { ProposalSignatureMetadata } from "app/proposalSignature/types"
import db, { ProposalStatus } from "db"
import * as z from "zod"
import { ProposalMetadata } from "../types"
import { Ctx } from "blitz"

const SendProposal = z.object({
  proposalId: z.string(),
  authorAddress: z.string(),
  authorSignature: z.string(), // should be optional in draft form
  signatureMessage: z.any(), //should be optional in draft form
  proposalHash: z.string(), // should be optional in draft form
})

// Sends a proposal to labeled roles
// Updates the proposal's status, deletes existing signatures
// to update the roles, milestones, or payments of a proposal, use/make their specific mutations
export default async function sendProposal(input: z.infer<typeof SendProposal>, ctx: Ctx) {
  const params = SendProposal.parse(input)

  const proposal = await db.proposal.findUnique({
    where: {
      id: params.proposalId,
    },
    include: {
      roles: true,
    },
  })

  if (!proposal) {
    throw Error("proposal does not exist")
  }

  const associatedAuthorRole = proposal.roles.find(
    (role) =>
      addressesAreEqual(role.address, params.authorAddress) && role.type === ProposalRoleType.AUTHOR
  )

  if (!associatedAuthorRole) {
    throw Error("address provided is not author")
  }

  // TODO: validate signature contents are actually signing message from author
  // for now, just make sure request sender is the author
  ctx.session.$authorize([params.authorAddress], [])

  const existingMetadata = proposal.data as ProposalMetadata

  const proposalMetadata: ProposalMetadata = {
    ...existingMetadata,
    authorAddress: params.authorAddress,
    authorSignature: params.authorSignature,
    signatureMessage: params.signatureMessage,
    proposalHash: params.proposalHash,
  }

  try {
    const res = await db.$transaction(async (db) => {
      // UPDATE PROPOSAL

      // saves author signature and sets status to AWAITING_APPROVAL
      await db.proposal.update({
        where: {
          id: params.proposalId,
        },
        data: {
          data: JSON.parse(JSON.stringify(proposalMetadata)),
          status: ProposalStatus.AWAITING_APPROVAL, // resets the need to collect signatures
        },
        include: {
          roles: true,
          milestones: true,
          payments: true,
          signatures: true,
        },
      })

      // Note: existing proposal signatures and role approvals for this proposal
      // should have already been wiped if an author made edits and wants to re-send the proposal

      const authorSignatureMetadata: ProposalSignatureMetadata = {
        signature: params.authorSignature,
        message: params.signatureMessage,
        proposalHash: params.proposalHash,
      }

      // SAVE AUTHOR SIGNATURE

      // create new signature and connect to proposal and author role
      await db.proposalSignature.create({
        data: {
          type: ProposalSignatureType.SEND,
          address: params.authorAddress,
          data: authorSignatureMetadata,
          // connect to this proposal
          proposal: {
            connect: {
              id: params.proposalId,
            },
          },
          // connect to the author's role
          roles: {
            connect: {
              id: associatedAuthorRole.id,
            },
          },
        },
      })
      // update author role to SENT approvalStatus to mark as done
      await db.proposalRole.update({
        where: {
          id: associatedAuthorRole.id,
        },
        data: {
          approvalStatus: ProposalRoleApprovalStatus.SENT,
        },
      })
    })

    return proposal
  } catch (err) {
    throw Error(`Error sending proposal, failed with error: ${err.message}`)
  }
}
