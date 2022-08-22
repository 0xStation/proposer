import db from "db"
import * as z from "zod"
import { ProposalStatus as PrismaProposalStatus } from "@prisma/client"
import { ProposalStatus } from "../types"

const GetProposalCountByRfpId = z.object({
  rfpId: z.string(),
  statuses: z.string().array().optional().default([]),
})

export const getProposalCountByRfpId = async (input: z.infer<typeof GetProposalCountByRfpId>) => {
  try {
    const selectedStatuses = input.statuses.map((status) =>
      status === ProposalStatus.SUBMITTED ? PrismaProposalStatus.PUBLISHED : status
    ) as PrismaProposalStatus[]

    const proposalCount = await db.proposal.count({
      where: {
        rfpId: input.rfpId,
        ...(selectedStatuses.length > 0 && { status: { in: selectedStatuses } }),
      },
    })

    return proposalCount as number
  } catch (err) {
    console.error("Error fetching proposal count. Failed with error: ", err)
    return 0
  }
}

export default getProposalCountByRfpId
