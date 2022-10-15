import db from "db"
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
    },
    include: {
      roles: {
        include: {
          account: true,
        },
      },
    },
  })

  console.log(proposals)

  if (!proposals) return []

  return proposals as unknown as Proposal[]
}
