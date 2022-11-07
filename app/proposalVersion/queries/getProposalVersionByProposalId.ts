import db, { ProposalVersion } from "db"
import * as z from "zod"

const GetProposalVersionByProposalId = z.object({
  proposalId: z.string(),
})

export default async function getProposalVersionByProposalId(
  params: z.infer<typeof GetProposalVersionByProposalId>
) {
  const versions = await db.proposalVersion.findMany({
    where: {
      proposalId: params.proposalId,
    },
    orderBy: {
      version: "desc", // sort from first to last index
    },
  })

  return versions as unknown as ProposalVersion[]
}
