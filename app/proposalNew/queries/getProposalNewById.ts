import db from "db"
import * as z from "zod"
import { ProposalNew } from "../types"

const GetProposalNewById = z.object({
  id: z.string(),
})

export default async function getProposalNewById(params: z.infer<typeof GetProposalNewById>) {
  const proposal = await db.proposalNew.findUnique({
    where: {
      id: params.id,
    },
    include: {
      roles: true,
    },
  })

  if (!proposal) {
    return null
  }

  return proposal as unknown as ProposalNew
}
