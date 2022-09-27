import { PaymentTerm } from "app/proposalPayment/types"
import { ZodToken } from "app/types/zod"
import db from "db"
import * as z from "zod"
import { ProposalMetadata } from "../types"

const UpdateProposalMetadata = z.object({
  proposalId: z.string(),
  contentTitle: z.string(),
  contentBody: z.string(),
  ipfsHash: z.string().optional(),
  ipfsPinSize: z.number().optional(),
  ipfsTimestamp: z.string().optional(),
  totalPayments: z.object({ token: ZodToken, amount: z.number() }).array(),
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
    totalPayments: params.totalPayments,
    paymentTerms: params.paymentTerms,
  } as unknown as ProposalMetadata

  try {
    const proposal = await db.proposal.update({
      where: { id: params.proposalId },
      data: {
        data: JSON.parse(JSON.stringify(proposalMetadata)),
      },
      include: {
        roles: true,
      },
    })
    return proposal
  } catch (err) {
    throw Error(`Error updating proposal, failed with error: ${err.message}`)
  }
}
