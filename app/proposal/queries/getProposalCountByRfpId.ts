import db, { ProposalStatus } from "db"
import * as z from "zod"

const GetProposalCountByRfpId = z.object({
  rfpId: z.string(),
})

export default async function getProposalCountByRfpId(
  params: z.infer<typeof GetProposalCountByRfpId>
) {
  const proposalCount = await db.proposal.count({
    where: {
      rfpId: params.rfpId,
      suppress: false,
      deleted: false,
      status: {
        not: ProposalStatus.DRAFT,
      },
    },
  })

  return proposalCount as number
}
