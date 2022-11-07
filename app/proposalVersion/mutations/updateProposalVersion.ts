import db from "db"
import * as z from "zod"

const UpdateProposalVersion = z.object({
  proposalId: z.string(),
  version: z.number(),
  contentTitle: z.string(),
  contentBody: z.string(),
  proposalSignatureMessage: z.any(),
  proposalHash: z.string(),
})

// Only updates the metadata of a proposal
// to update the roles, milestones, or payments of a proposal, use/make their specific mutations
export default async function updateProposalVersion(input: z.infer<typeof UpdateProposalVersion>) {
  const params = UpdateProposalVersion.parse(input)
  let proposalVersion
  try {
    proposalVersion = await db.proposalVersion.update({
      where: { proposalId_version: { proposalId: params.proposalId, version: params.version } },
      data: {
        data: {
          content: {
            title: params?.contentTitle,
            body: params?.contentBody,
          },
          proposalSignatureMessage: params?.proposalSignatureMessage,
          proposalHash: params?.proposalHash,
        },
      },
    })

    return proposalVersion
  } catch (err) {
    throw Error(`Error updating proposal version, failed with error: ${err.message}`)
  }
}
