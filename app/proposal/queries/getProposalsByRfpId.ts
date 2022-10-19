import db, { ProposalStatus } from "db"
import * as z from "zod"
import { Proposal } from "../types"

const GetProposalsByRfpId = z.object({
  rfpId: z.string(),
})

export default async function getProposalsByRfpId(params: z.infer<typeof GetProposalsByRfpId>) {
  const proposals = await db.proposal.findMany({
    where: {
      rfpId: params.rfpId,
      suppress: false,
      status: {
        not: ProposalStatus.DRAFT,
      },
    },
    include: {
      roles: {
        include: {
          account: true,
        },
      },
    },
    orderBy: {
      timestamp: "desc",
    },
  })

  if (!proposals) return []

  return proposals as unknown as Proposal[]
}
