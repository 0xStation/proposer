import * as z from "zod"
import db from "db"
import { invoke } from "blitz"
import { ProposalStatus, ProposalRoleApprovalStatus } from "@prisma/client"
import pinProposalSignature from "app/proposalSignature/mutations/pinProposalSignature"
import pinProposal from "./pinProposal"
import { sendProposalApprovedEmail } from "app/utils/email"
import { getEmails } from "app/utils/privy"

const ApproveProposal = z.object({
  proposalId: z.string(),
  signerAddress: z.string(),
  message: z.any(),
  signature: z.string(),
  representingRoles: z
    .object({
      roleId: z.string(),
      complete: z.boolean(),
    })
    .array(), // array of type role
})

export default async function approveProposal(input: z.infer<typeof ApproveProposal>) {
  const params = ApproveProposal.parse(input)

  if (params.representingRoles.length === 0) {
    throw Error("missing representing roles ids")
  }

  let proposalSignature
  try {
    // create proposal signature connected to proposalRole
    // update linked proposalRoles to be of status complete
    // once we support multisigs, check if quorum is met first before updating
    const [proposalSig] = await db.$transaction([
      db.proposalSignature.create({
        data: {
          address: params.signerAddress,
          data: {
            message: params.message,
            signature: params.signature,
            representingRoles: params.representingRoles,
          },
          proposal: {
            connect: {
              id: params.proposalId,
            },
          },
          roles: {
            connect: params.representingRoles.map((role) => {
              return {
                id: role.roleId,
              }
            }),
          },
        },
      }),
      // update role with complete status
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
        roles: true,
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
  const pendingStatusChange = proposal.roles.every(
    (role) =>
      role.approvalStatus === ProposalRoleApprovalStatus.APPROVED ||
      role.approvalStatus === ProposalRoleApprovalStatus.SENT
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
          roles: true,
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
        const recipientEmails = await getEmails(proposal.roles.map((role) => role.address))
        await sendProposalApprovedEmail({ recipients: recipientEmails, proposal })
      } catch (e) {
        // silently fail
        console.warn("Failed to send notification emails in `approveProposal`", e)
      }
    }

    return updatedProposal
  }
}
