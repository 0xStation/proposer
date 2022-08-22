import * as z from "zod"
import db, { ProposalStatus } from "db"

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

    const proposal = await db.proposal.findUnique({
      where: { id: params.proposalId },
      include: {
        approvals: true,
        rfp: { include: { checkbook: true } },
      },
    })

    // get typescript to compile
    // if proposal object does not exist, will have thrown earlier on proposalApproval create
    if (!proposal || !proposal.rfp || !proposal.rfp?.checkbook) {
      return
    }

    // determine new status for proposal
    let newStatus
    if (
      proposal.approvals.length >= (proposal.rfp.checkbook.quorum || 0) &&
      proposal.status !== ProposalStatus.APPROVED
    ) {
      newStatus = ProposalStatus.APPROVED
    } else if (
      proposal.approvals.length < (proposal.rfp.checkbook.quorum || 0) &&
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
  })

  return results
}
