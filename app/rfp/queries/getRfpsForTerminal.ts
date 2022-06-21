import db from "db"
import * as z from "zod"
import { Rfp } from "../types"
import { computeRfpDbStatusFilter, computeRfpProductStatus } from "../utils"

const GetRfpsByTerminalId = z.object({
  terminalId: z.number(),
  statuses: z.string().array().optional(),
  page: z.number().optional().default(0),
  paginationTake: z.number().optional().default(50),
})

export default async function getRfpsByTerminalId(input: z.infer<typeof GetRfpsByTerminalId>) {
  let statuses = []

  if (input.statuses && Array.isArray(input.statuses) && input.statuses?.length) {
    const rfpDbStatusFilters = input.statuses?.map((status) => {
      return computeRfpDbStatusFilter(status)
    })

    statuses = { OR: rfpDbStatusFilters } as any
  }

  const rfps = await db.rfp.findMany({
    where: {
      terminalId: input.terminalId,
      ...statuses,
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

  return rfps.map((rfp) => {
    return {
      ...rfp,
      status: computeRfpProductStatus(rfp.status, rfp.startDate, rfp.endDate),
      submissionCount: rfp._count.proposals,
    } as unknown as Rfp
  })
}
