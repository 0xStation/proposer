import db from "db"
import * as z from "zod"
import { ProposalStatus as PrismaProposalStatus } from "@prisma/client"
import { Proposal } from "../types"
import { computeProposalDbFilterFromProposalApprovals, computeProposalStatus } from "../utils"

const GetProposalCountByRfpId = z.object({
  rfpId: z.string(),
  // statuses: z.string().array().optional().default([]),
  // quorum: z.number(),
})

export const getProposalCountByRfpId = async (input: z.infer<typeof GetProposalCountByRfpId>) => {
  try {
    // const proposalsWhere = await computeProposalDbFilterFromProposalApprovals({
    //   statuses: input.statuses,
    //   quorum: input.quorum,
    //   rfpId: input.rfpId,
    // })

    const proposalCount = await db.proposal.count({
      where: {
        rfpId: input.rfpId,
        status: PrismaProposalStatus.PUBLISHED,
        // ...proposalsWhere,
      },
    })

    return proposalCount as number
  } catch (err) {
    console.error("Error fetching proposal count. Failed with error: ", err)
    return 0
  }
}

export default getProposalCountByRfpId
