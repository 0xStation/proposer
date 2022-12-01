import { invoke } from "@blitzjs/rpc"
import * as z from "zod"
import db from "db"
import { ProposalStatus, ParticipantApprovalStatus } from "@prisma/client"
import pinProposalSignature from "app/proposalSignature/mutations/pinProposalSignature"
import pinProposal from "./pinProposal"
import { sendProposalApprovedEmail } from "app/utils/email"
import { getEmails } from "app/utils/privy"

const ApproveProposal = z.object({
  proposalId: z.string(),
  proposalVersion: z.number(),
  signerAddress: z.string(),
  message: z.any(),
  signature: z.string(),
  representingParticipants: z
    .object({
      participantId: z.string(),
      complete: z.boolean(),
    })
    .array(),
})

export default async function approveProposal(input: z.infer<typeof ApproveProposal>) {
  const params = ApproveProposal.parse(input)

  if (params.representingParticipants.length === 0) {
    throw Error("missing representing participants ids")
  }

  let proposalSignature
  try {
    // create proposal signature connected to participant
    // update linked participants to be of status complete
    // once we support multisigs, check if quorum is met first before updating
    const [proposalSig] = await db.$transaction([
      db.proposalSignature.create({
        data: {
          address: params.signerAddress,
          proposalVersion: params.proposalVersion,
          data: {
            message: params.message,
            signature: params.signature,
            representingParticipants: params.representingParticipants,
          },
          proposal: {
            connect: {
              id: params.proposalId,
            },
          },
          participants: {
            connect: params.representingParticipants.map((participant) => {
              return {
                id: participant.participantId,
              }
            }),
          },
        },
      }),
      // update participant with complete status
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
    proposalSignature = proposalSig
  } catch (err) {
    throw Error(`Failed to create signature in approveProposal: ${err}`)
  }

  try {
    await pinProposalSignature({
      proposalSignatureId: proposalSignature?.id,
      signature: params?.signature,
      signatureMessage: params?.message,
    })
  } catch (err) {
    throw Error(`Failed to pin proposal signature to ipfs in approveProposal: ${err}`)
  }

  let proposal
  try {
    proposal = await db.proposal.findUnique({
      where: { id: params.proposalId },
      include: {
        participants: true,
        milestones: true,
        payments: true,
        signatures: true,
      },
    })
  } catch (err) {
    throw Error(`Failed to find proposal in approveProposal: ${err}`)
  }

  // update proposal status based on status of signatures
  // if current status is the same as the pending status change
  // skip the update
  const pendingStatusChange = proposal.participants.every(
    (participant) =>
      participant.approvalStatus === ParticipantApprovalStatus.APPROVED ||
      participant.approvalStatus === ParticipantApprovalStatus.SENT
  )
    ? ProposalStatus.APPROVED
    : ProposalStatus.AWAITING_APPROVAL

  if (proposal.status === pendingStatusChange) {
    return proposal
  } else {
    let updatedProposal
    try {
      updatedProposal = await db.proposal.update({
        where: { id: params.proposalId },
        data: {
          status: pendingStatusChange,
          // if approving, move milestone from -1 (default) to 0 (proposal approved)
          ...(pendingStatusChange === ProposalStatus.APPROVED &&
            // only set milestone index if there are milestones
            proposal.milestones.length > 0 && {
              // take milestone with lowest index
              // in case payment terms are on proposal approval, sets current milestone to 0
              // in case payment terms are on proposal completion, sets current milestone to 1
              currentMilestoneIndex: proposal.milestones.sort((a, b) =>
                a.index > b.index ? 1 : -1
              )[0].index,
            }),
        },
        include: {
          participants: true,
          milestones: true,
          payments: true,
          signatures: true,
        },
      })
    } catch (err) {
      console.error("Failed to update proposal status in `approveProposal`", err)
      throw Error(err)
    }

    if (pendingStatusChange === ProposalStatus.APPROVED) {
      try {
        updatedProposal = await invoke(pinProposal, { proposalId: proposal?.id as string })
      } catch (err) {
        console.error("Failed to pin proposal in `approveProposal`", err)
        throw Error(err)
      }

      try {
        // send fully approved email
        const recipientEmails = await getEmails(
          proposal.participants.map((participant) => participant.accountAddress)
        )
        await sendProposalApprovedEmail({ recipients: recipientEmails, proposal })
      } catch (e) {
        // silently fail
        console.warn("Failed to send notification emails in `approveProposal`", e)
      }
    }

    return updatedProposal
  }
}
