import * as z from "zod"
import db from "db"
import { ProposalNewStatus, ProposalRoleApprovalStatus } from "@prisma/client"
import pinProposalSignature from "app/proposalSignature/mutations/pinProposalSignature"

const ApproveProposalNew = z.object({
  proposalId: z.string(),
  signerAddress: z.string(),
  message: z.any(),
  signature: z.string(),
  representingRoles: z.string().array(), // array of role ids
})

export default async function approveProposalNew(input: z.infer<typeof ApproveProposalNew>) {
  const params = ApproveProposalNew.parse(input)

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
            connect: params.representingRoles.map((roleId) => {
              return {
                id: roleId,
              }
            }),
          },
        },
      }),
      // update role with complete status
      ...params.representingRoles.map((roleId) => {
        return db.proposalRole.update({
          where: {
            id: roleId,
          },
          data: {
            approvalStatus: ProposalRoleApprovalStatus.COMPLETE,
          },
        })
      }),
    ])
    proposalSignature = proposalSig
  } catch (err) {
    throw Error(`Failed to create signature in approveProposalNew: ${err}`)
  }

  try {
    const updateProposalSignature = await pinProposalSignature({
      proposalSignatureId: proposalSignature?.id,
      signature: params?.signature,
      signatureMessage: params?.message,
    })
    console.log("updateProposalSignature", updateProposalSignature)
  } catch (err) {
    throw Error(`Failed to pin proposal signature to ipfs in approveProposalNew: ${err}`)
  }

  // TODO: for representing multisigs, query if signatures have hit quorum for it

  let proposal
  try {
    proposal = await db.proposalNew.findUnique({
      where: { id: params.proposalId },
      include: {
        roles: true,
        milestones: true,
        payments: true,
        signatures: true,
      },
    })
  } catch (err) {
    throw Error(`Failed to find proposal in approveProposalNew: ${err}`)
  }

  // update proposal status based on status of signatures
  // if current status is the same as the pending status change
  // skip the update
  const pendingStatusChange = proposal.roles.every(
    (role) => role.approvalStatus === ProposalRoleApprovalStatus.COMPLETE
  )
    ? ProposalNewStatus.APPROVED
    : ProposalNewStatus.AWAITING_APPROVAL

  if (proposal.status === pendingStatusChange) {
    return proposal
  } else {
    const updatedProposal = await db.proposalNew.update({
      where: { id: params.proposalId },
      data: {
        status: pendingStatusChange,
        // if approving, move milestone from -1 (default) to 0 (proposal approved)
        ...(pendingStatusChange === ProposalNewStatus.APPROVED && {
          // take milestone with lowest index
          // in case payment terms are on proposal approval, sets current milestone to 0
          // in case payment terms are on proposal completion, sets current milestone to 1
          currentMilestoneIndex: proposal.milestones.sort((a, b) => (a.index > b.index ? 1 : -1))[0]
            .index,
        }),
      },
      include: {
        roles: true,
        milestones: true,
        payments: true,
        signatures: true,
      },
    })

    return updatedProposal
  }
}
