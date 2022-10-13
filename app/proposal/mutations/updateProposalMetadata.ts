import { PaymentTerm } from "app/proposalPayment/types"
import { ZodToken } from "app/types/zod"
import db, { ProposalStatus } from "db"
import * as z from "zod"
import { ProposalMetadata } from "../types"

const UpdateProposalMetadata = z.object({
  proposalId: z.string(),
  contentTitle: z.string(),
  contentBody: z.string(),
  authorSignature: z.string(), // should be optional in draft form
  signatureMessage: z.any(), //should be optional in draft form
  proposalHash: z.string(), // should be optional in draft form
  ipfsHash: z.string().optional(),
  ipfsPinSize: z.number().optional(),
  ipfsTimestamp: z.string().optional(),
  totalPayments: z.object({ token: ZodToken, amount: z.number() }).array().optional(),
  paymentTerms: z.enum([PaymentTerm.ON_AGREEMENT, PaymentTerm.AFTER_COMPLETION]).optional(),
})

// Only updates the metadata of a proposal
// to update the roles, milestones, or payments of a proposal, use/make their specific mutations
export default async function updateProposalMetadata(
  input: z.infer<typeof UpdateProposalMetadata>
) {
  const params = UpdateProposalMetadata.parse(input)

  const { ipfsHash, ipfsPinSize, ipfsTimestamp } = params
  const proposalMetadata = {
    content: {
      title: params.contentTitle,
      body: params.contentBody,
    },
    ipfsMetadata: {
      hash: ipfsHash,
      ipfsPinSize,
      timestamp: ipfsTimestamp,
    },
    proposalHash: params.proposalHash,
    authorSignature: params.authorSignature,
    signatureMessage: params.signatureMessage,
    totalPayments: params.totalPayments,
    paymentTerms: params.paymentTerms,
  } as unknown as ProposalMetadata

  try {
    let proposal = await db.proposal.update({
      where: { id: params.proposalId },
      data: {
        data: JSON.parse(JSON.stringify(proposalMetadata)),
      },
      include: {
        roles: true,
        milestones: true,
        payments: true,
        signatures: true,
      },
    })

    if (
      params?.authorSignature &&
      params?.signatureMessage &&
      params?.proposalHash &&
      proposal.status === ProposalStatus.DRAFT
    ) {
      proposal = await db.proposal.update({
        where: {
          id: params.proposalId,
        },
        data: {
          status: ProposalStatus.AWAITING_APPROVAL,
        },
        include: {
          roles: true,
          milestones: true,
          payments: true,
          signatures: true,
        },
      })
    }
    return proposal
  } catch (err) {
    throw Error(`Error updating proposal, failed with error: ${err.message}`)
  }
}
