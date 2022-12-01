import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { ParticipantApprovalStatus, ProposalSignatureType } from "@prisma/client"
import { ProposalSignatureMetadata } from "app/proposalSignature/types"
import db, { ProposalStatus } from "db"
import * as z from "zod"
import { ProposalMetadata } from "../types"
import { Ctx } from "blitz"
import { getEmails } from "app/utils/privy"
import { sendNewProposalEmail } from "app/utils/email"
import { ProposalParticipantMetadata } from "app/proposalParticipant/types"

const SendProposal = z.object({
  proposalId: z.string(),
  authorAddress: z.string(),
  authorSignature: z.string(), // should be optional in draft form
  signatureMessage: z.any(), //should be optional in draft form
  proposalHash: z.string(), // should be optional in draft form
  representingParticipants: z
    .object({
      participantId: z.string(),
      complete: z.boolean(),
    })
    .array()
    .optional()
    .default([]), // array of type participant
})

// Sends a proposal to labeled participants
// Updates the proposal's status, deletes existing signatures
// to update the participants, milestones, or payments of a proposal, use/make their specific mutations
export default async function sendProposal(input: z.infer<typeof SendProposal>, ctx: Ctx) {
  const params = SendProposal.parse(input)

  const proposal = await db.proposal.findUnique({
    where: {
      id: params.proposalId,
    },
    include: {
      participants: {
        include: {
          account: true,
        },
      },
    },
  })

  if (!proposal) {
    throw Error("proposal does not exist")
  }

  const authorParticipant = proposal.participants.find(
    (participant) =>
      addressesAreEqual(participant.accountAddress, params.authorAddress) &&
      (participant.data as ProposalParticipantMetadata).isOwner
  )

  if (!authorParticipant) {
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
      // Note: existing proposal signatures and participant approvals for this proposal
      // should have already been wiped if an author made edits and wants to re-send the proposal

      // create new signature and connect to proposal and author participant
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
          // connect to the author's participant
          participants: {
            connect: {
              id: authorParticipant.id,
            },
          },
        },
      }),
      // create new signature and connect to proposal and author participant
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
          // connect to the other participants held by author
          participants: {
            connect: params.representingParticipants.map((participant) => {
              return { id: participant.participantId }
            }),
          },
        },
      }),
      // update author participant to SENT approvalStatus to mark as done
      db.proposalParticipant.update({
        where: {
          id: authorParticipant.id,
        },
        data: {
          approvalStatus: ParticipantApprovalStatus.SENT,
        },
      }),
      // update non-author participants with complete status
      // if signature is a multisig, we don't want to mark as complete unless it has met quorum
      // so we filter for participants that are 'complete'.
      // complete is a type passed from the front-end indiciating that it is ready to be pushed to status complete
      ...params.representingParticipants
        .filter((participant) => {
          return participant.complete
        })
        .map((participant) => {
          return db.proposalParticipant.update({
            where: {
              id: participant.participantId,
            },
            data: {
              approvalStatus: ParticipantApprovalStatus.APPROVED,
            },
          })
        }),
    ])

    try {
      // send notification emails
      const author = authorParticipant?.account

      const emails = await getEmails(
        proposal.participants
          .filter(
            (participant) =>
              !addressesAreEqual(participant.accountAddress, authorParticipant.accountAddress)
          )
          .map((participant) => participant.accountAddress)
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
