import { invoke } from "@blitzjs/rpc"
import * as z from "zod"
import db from "db"
import { ProposalStatus, ProposalRoleApprovalStatus } from "@prisma/client"
import pinProposal from "./pinProposal"
import { sendProposalApprovedEmail } from "app/utils/email"
import { getEmails } from "app/utils/privy"
import { AddressType } from "@prisma/client"
import { getGnosisSafeDetails } from "app/utils/getGnosisSafeDetails"

const RetroactivelyApproveProposal = z.object({
  proposalId: z.string(),
  roleId: z.string(),
})

export default async function retroactivelyApproveProposal(
  input: z.infer<typeof RetroactivelyApproveProposal>
) {
  const params = RetroactivelyApproveProposal.parse(input)

  try {
    await db.proposalRole.update({
      where: {
        id: params.roleId,
      },
      data: {
        approvalStatus: ProposalRoleApprovalStatus.APPROVED,
      },
    })
  } catch (err) {
    throw Error(`Failed to update proposal role to approved: ${err}`)
  }

  let proposal
  try {
    proposal = await db.proposal.findUnique({
      where: { id: params.proposalId },
      include: {
        roles: {
          include: {
            account: true,
          },
        },
        milestones: true,
        payments: true,
        signatures: true,
      },
    })
  } catch (err) {
    throw Error(`Failed to find proposal in approveProposal: ${err}`)
  }

  try {
    // if the proposal moves into approved, we need to take a snapshot of the current quorums on any safe roles
    // to make sure we know what the quorum was at the time of approval in case in changes

    let accountQuorumSnapshots = {}
    let gnosisRequests: any[] = []
    proposal.roles.forEach((role) => {
      if (role.account?.addressType === AddressType.SAFE && role.account?.data.chainId)
        gnosisRequests.push(
          getGnosisSafeDetails(role.account?.data.chainId as number, role.address)
        )
    })
    // batch await gnosis requests and add safe details to each account metadata accumulator
    const gnosisResults = await Promise.all(gnosisRequests)
    gnosisResults.forEach((results) => {
      if (!results) return
      accountQuorumSnapshots[results.address] = results.quorum
    })

    await db.$transaction([
      ...proposal.roles
        .filter((role) => {
          return role.account?.addressType === AddressType.SAFE
        })
        .map((role) => {
          return db.proposalRole.update({
            where: {
              id: role.id,
            },
            data: {
              data: {
                preApprovalQuorum: accountQuorumSnapshots[role.account.address],
              },
            },
          })
        }),
    ])
  } catch (e) {
    console.error("could not update proposalRoles")
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
