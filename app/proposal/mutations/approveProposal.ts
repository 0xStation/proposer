<<<<<<< HEAD
=======
import db from "db"
import { Ctx } from "blitz"
>>>>>>> dadcdf7 (leaving comments on last two)
import * as z from "zod"
import db, { ProposalStatus } from "db"
import { AddressType } from "app/types"
import { ProposalMetadata } from "../types"

const ApproveProposal = z.object({
  checkId: z.string(),
  proposalId: z.string(),
  signerAddress: z.string(),
  signature: z.string(),
  signatureMessage: z.any(),
})

export default async function approveProposal(input: z.infer<typeof ApproveProposal>) {
  const params = ApproveProposal.parse(input)
  // use a transaction to apply many database writes at once
  // creates proposal approval, check approval
  // also updates proposal status if moving from SUBMITTED->IN_REVIEW (first approval) or IN_REVIEW->APPROVED (quorum approval)
  const results = await db.$transaction(async (db) => {
    const proposal = await db.proposal.findUnique({
      where: { id: params.proposalId },
      include: {
        approvals: true,
      },
    })

    if (!proposal) {
      throw Error("Proposal not found")
    }

    // create approval objects, throws if creating duplicate
    await db.proposalApproval.create({
      data: {
        proposalId: params.proposalId,
        signerAddress: params.signerAddress,
        data: {
          signature: params.signature,
          signatureMessage: params.signatureMessage,
        },
      },
    })

    await db.checkApproval.create({
      data: {
        checkId: params.checkId,
        signerAddress: params.signerAddress,
        data: {
          signature: params.signature,
          signatureMessage: params.signatureMessage,
        },
      },
    })

    // Fetch proposal and update status if needed

    const metadata = proposal.data as unknown as ProposalMetadata
    if (metadata.funding.senderType === AddressType.CHECKBOOK && metadata.funding.senderAddress) {
      const checkbook = await db.checkbook.findUnique({
        where: { address: metadata.funding.senderAddress },
      })

      // determine new status for proposal
      let newStatus
      if (
        proposal.approvals.length + 1 >= (checkbook?.quorum || 0) &&
        proposal.status !== ProposalStatus.APPROVED
      ) {
        newStatus = ProposalStatus.APPROVED
      } else if (
        proposal.approvals.length + 1 < (checkbook?.quorum || 0) &&
        proposal.status !== ProposalStatus.IN_REVIEW
      ) {
        newStatus = ProposalStatus.IN_REVIEW
      }
      // if there is a new status to set, apply update
      if (newStatus) {
        await db.proposal.update({
          where: { id: params.proposalId },
          data: {
            status: newStatus,
          },
        })
      }
    }
  })

  return results
}
