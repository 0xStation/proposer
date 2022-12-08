import db from "db"
import * as z from "zod"
import { ProposalVersion } from "../types"

const GetProposalVersionsByProposalId = z.object({
  proposalId: z.string(),
})

export default async function getProposalVersionsByProposalId(
  params: z.infer<typeof GetProposalVersionsByProposalId>
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
