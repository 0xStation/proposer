import db from "db"
import * as z from "zod"
import { Rfp } from "../types"
import { computeRfpDbAndDeletedStatusFilter, computeRfpProductStatus } from "../utils"
import { PAGINATION_TAKE } from "../../core/utils/constants"

const GetRfpsByTerminalId = z.object({
  terminalId: z.number(),
  statuses: z.string().array().optional(),
  page: z.number().optional().default(0),
  paginationTake: z.number().optional().default(PAGINATION_TAKE),
  includeDeletedRfps: z.boolean().optional().default(false),
})

export async function getRfpsByTerminalId(input: z.infer<typeof GetRfpsByTerminalId>) {
  const rfpsWhere = computeRfpDbAndDeletedStatusFilter({
    statuses: input.statuses,
    includeDeletedRfps: input.includeDeletedRfps,
  })

  const rfps = await db.rfp.findMany({
    where: {
      terminalId: input.terminalId,
      ...rfpsWhere,
    },
    include: {
      author: true,
      _count: {
        select: { proposals: true },
      },
    },
    take: input.paginationTake,
    skip: input.page * input.paginationTake,
  })

  if (!rfps) {
    return null
  }

  return rfps.map((rfp) => {
    return {
      ...rfp,
      status: computeRfpProductStatus(rfp.status, rfp.startDate, rfp.endDate),
      submissionCount: rfp._count.proposals,
    } as unknown as Rfp
  })
}

export default getRfpsByTerminalId
