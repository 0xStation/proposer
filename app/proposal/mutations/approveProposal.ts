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
  const results = await db.$transaction(async (db) => {
    const proposal = await db.proposal.findUnique({
      where: { id: input.proposalId },
      include: {
        approvals: true,
      },
    })

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

    if (
      proposal.approvals.length + 1 >= (checkbook?.quorum || 0) &&
      proposal.status !== ProposalStatus.APPROVED
    ) {
      await db.proposal.update({
        where: { id: input.proposalId },
        data: {
          status: ProposalStatus.APPROVED,
        },
      })
    } else if (
      proposal.approvals.length + 1 < (checkbook?.quorum || 0) &&
      proposal.status !== ProposalStatus.IN_REVIEW
    ) {
      await db.proposal.update({
        where: { id: input.proposalId },
        data: {
          status: ProposalStatus.IN_REVIEW,
        },
      })
    }

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
  })

  return results
}
