import { ZodToken } from "app/types/zod"
import db from "db"
import * as z from "zod"
import { ProposalNewMetadata } from "../types"

const UpdateProposalNewMetadata = z.object({
  proposalId: z.string(),
  contentTitle: z.string(),
  contentBody: z.string(),
  ipfsHash: z.string().optional(),
  ipfsPinSize: z.number().optional(), // ipfs
  ipfsTimestamp: z.string().optional(),
  totalPayments: z.object({ token: ZodToken, amount: z.number() }).array(),
})

// Only updates the metadata of a proposal
// to update the roles, milestones, or payments of a proposal, use/make their specific mutations
export default async function updateProposalMetadata(
  input: z.infer<typeof UpdateProposalNewMetadata>
) {
  const params = UpdateProposalNewMetadata.parse(input)

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
  } as unknown as ProposalNewMetadata

  try {
    const proposal = await db.proposalNew.update({
      where: { id: params.proposalId },
      // TODO: as of 9/1 we currently only support proposals of type "FUNDING"
      // but in the future we need to figure out how to void a funding proposal
      // and change it to a different type and vice versa.
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
