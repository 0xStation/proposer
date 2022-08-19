import { FundingSenderType } from "app/types"
import db, { ProposalStatus } from "db"
import * as z from "zod"
import { ProposalMetadata } from "../types"

const ApproveProposal = z.object({
  checkId: z.string(),
  proposalId: z.string(),
  signerAddress: z.string(),
  signature: z.string(),
  signatureMessage: z.any(),
})

export default async function approveProposal(input: z.infer<typeof ApproveProposal>) {
  // use a transaction to apply many database writes at once
  // creates proposal approval, check approval, and potentially status update to proposal
  const results = await db.$transaction(async (db) => {
    // create approval objects, throws if creating duplicate

    await db.proposalApproval.create({
      data: {
        proposalId: input.proposalId,
        signerAddress: input.signerAddress,
        data: {
          signature: input.signature,
          signatureMessage: input.signatureMessage,
        },
      },
    })

    await db.checkApproval.create({
      data: {
        checkId: input.checkId,
        signerAddress: input.signerAddress,
        data: {
          signature: input.signature,
          signatureMessage: input.signatureMessage,
        },
      },
    })

    // Fetch proposal and update status if needed

    const proposal = await db.proposal.findUnique({
      where: { id: input.proposalId },
      include: {
        approvals: true,
      },
    })

    // get typescript to compile
    // if proposal object does not exist, will have thrown earlier on proposalApproval create
    if (!proposal) {
      return
    }

    const metadata = proposal.data as unknown as ProposalMetadata
    if (metadata.funding.senderType !== FundingSenderType.CHECKBOOK) {
      return
    }

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
        where: { id: input.proposalId },
        data: {
          status: newStatus,
        },
      })
    }
  })

  return results
}
