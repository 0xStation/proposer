import * as z from "zod"
import db from "db"
import pinJsonToPinata from "app/utils/pinata"
import updateProposalNewMetadata from "./updateProposalNewMetadata"
import { ProposalNewStatus, ProposalRoleApprovalStatus } from "@prisma/client"

const ApproveProposalNew = z.object({
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

export default async function approveProposalNew(input: z.infer<typeof ApproveProposalNew>) {
  const params = ApproveProposalNew.parse(input)

  if (params.representingRoles.length === 0) {
    throw Error("missing representing roles ids")
  }

  try {
    // create proposal signature connected to proposalRole
    // update linked proposalRoles to be of status complete
    // once we support multisigs, check if quorum is met first before updating
    await db.$transaction([
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
              approvalStatus: ProposalRoleApprovalStatus.COMPLETE,
            },
          })
        }),
    ])
  } catch (err) {
    throw Error(`Failed to create signature in approveProposalNew: ${err}`)
  }

  // TODO: for representing multisigs, query if signatures have hit quorum for it

  // UPLOAD TO IPFS
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

  if (proposal.status !== pendingStatusChange) {
    await db.proposalNew.update({
      where: { id: params.proposalId },
      data: {
        status: pendingStatusChange,
        // if approving, move milestone from -1 (default) to 0 (proposal approved)
        ...(pendingStatusChange === ProposalNewStatus.APPROVED &&
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
    })
  }

  // flattening proposal's data json object for the ipfs proposal
  let proposalCopy = JSON.parse(JSON.stringify(proposal.data))

  proposalCopy.type = proposal.type
  proposalCopy.timestamp = proposal.timestamp
  proposalCopy.roles = JSON.parse(JSON.stringify(proposal.roles))
  proposalCopy.payments = Object.assign({}, proposal.payments)
  proposalCopy.signatures = JSON.parse(JSON.stringify(proposal.signatures))

  // Pinata api here: https://docs.pinata.cloud/pinata-api/pinning/pin-json
  // see `pinJsonToIpfs` api for more details on api config structure
  const pinataProposal = {
    pinataOptions: {
      cidVersion: 1, // https://docs.ipfs.tech/concepts/content-addressing/#cid-versions
    },
    pinataMetadata: {
      name: proposal?.id, // optional field that helps tag the file
    },
    pinataContent: {
      proposal: proposalCopy,
    },
  }

  let ipfsResponse
  try {
    ipfsResponse = await pinJsonToPinata(pinataProposal)
  } catch (err) {
    throw Error(`Call to pinata failed with error: ${err}`)
  }

  try {
    // add ipfs response to proposal
    const updatedProposal = await updateProposalNewMetadata({
      proposalId: params.proposalId,
      contentTitle: proposal?.data?.content?.title,
      contentBody: proposal?.data?.content?.body,
      ipfsHash: ipfsResponse.IpfsHash,
      ipfsPinSize: ipfsResponse.PinSize,
      ipfsTimestamp: ipfsResponse.Timestamp,
      totalPayments: proposal?.data?.totalPayments,
      paymentTerms: proposal?.data?.paymentTerms,
    })
    return updatedProposal
  } catch (err) {
    throw Error(`Failure updating proposal: ${err}`)
  }
}
