import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { ProposalRoleApprovalStatus, ProposalRoleType, ProposalSignatureType } from "@prisma/client"
import { ProposalSignatureMetadata } from "app/proposalSignature/types"
import db, { ProposalStatus } from "db"
import * as z from "zod"
import { ProposalMetadata } from "../types"
import { Ctx } from "blitz"
import { getEmails } from "app/utils/privy"
import { sendNewProposalEmail } from "app/utils/email"

const SendProposal = z.object({
  proposalId: z.string(),
  authorAddress: z.string(),
  authorSignature: z.string(), // should be optional in draft form
  signatureMessage: z.any(), //should be optional in draft form
  proposalHash: z.string(), // should be optional in draft form
  representingRoles: z
    .object({
      roleId: z.string(),
      complete: z.boolean(),
    })
    .array()
    .optional()
    .default([]), // array of type role
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
      roles: {
        include: {
          account: true,
        },
      },
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
    const authorSignatureMetadata: ProposalSignatureMetadata = {
      signature: params.authorSignature,
      message: params.signatureMessage,
      proposalHash: params.proposalHash,
    }

    const res = await db.$transaction([
      // saves author signature and sets status to AWAITING_APPROVAL
      db.proposal.update({
        where: {
          id: params.proposalId,
        },
        data: {
          data: JSON.parse(JSON.stringify(proposalMetadata)),
          status: ProposalStatus.AWAITING_APPROVAL,
        },
      }),
      db.proposalVersion.update({
        where: {
          proposalId_version: {
            proposalId: proposal?.id,
            version: proposal?.version,
          },
        },
        data: {
          data: {
            content: {
              title: "Version 1",
              body: undefined,
            },
            proposalSignatureMessage: params?.signatureMessage,
            proposalHash: params.proposalHash,
          },
        },
      }),
      // Note: existing proposal signatures and role approvals for this proposal
      // should have already been wiped if an author made edits and wants to re-send the proposal

      // create new signature and connect to proposal and author role
      db.proposalSignature.create({
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
      }),
      // create new signature and connect to proposal and author role
      db.proposalSignature.create({
        data: {
          type: ProposalSignatureType.APPROVE,
          address: params.authorAddress,
          data: authorSignatureMetadata,
          // connect to this proposal
          proposal: {
            connect: {
              id: params.proposalId,
            },
          },
          // connect to the other roles held by author
          roles: {
            connect: params.representingRoles.map((role) => {
              return { id: role.roleId }
            }),
          },
        },
      }),
      // update author role to SENT approvalStatus to mark as done
      db.proposalRole.update({
        where: {
          id: associatedAuthorRole.id,
        },
        data: {
          approvalStatus: ProposalRoleApprovalStatus.SENT,
        },
      }),
      // update non-author roles with complete status
      // if signature is a multisig, we don't want to mark as complete unless it has met quorum
      // so we filter for roles that are 'complete'.
      // complete is a type passed from the front-end indiciating that it is ready to be pushed to status complete
      ...params.representingRoles
        .filter((role) => {
          return role.complete
        })
        .map((role) => {
          return db.proposalRole.update({
            where: {
              id: role.roleId,
            },
            data: {
              approvalStatus: ProposalRoleApprovalStatus.APPROVED,
            },
          })
        }),
    ])

    try {
      // send notification emails
      const author = proposal.roles.find((role) => role.type === ProposalRoleType.AUTHOR)?.account

      const emails = await getEmails(
        proposal.roles
          .filter(
            (role) => role.type !== ProposalRoleType.AUTHOR && role.address !== author?.address
          )
          .map((role) => role.address)
      )

      await sendNewProposalEmail({
        recipients: emails,
        account: author,
        proposal: proposal,
      })
    } catch (e) {
      // silently fail
      console.warn("Failed to send notification emails in `createProposal`", e)
    }

    return true
  } catch (err) {
    throw Error(`Error sending proposal, failed with error: ${err.message}`)
  }
}
