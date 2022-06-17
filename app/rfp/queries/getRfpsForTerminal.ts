import db from "db"
import * as z from "zod"
import { Rfp } from "../types"
import { computeRfpDbStatusFilter, computeRfpProductStatus } from "../utils"

const GetRfpsByTerminalId = z.object({
  terminalId: z.number(),
  status: z.string().optional(),
})

export default async function getRfpsByTerminalId(input: z.infer<typeof GetRfpsByTerminalId>) {
  const rfps = await db.rfp.findMany({
    where: {
      terminalId: input.terminalId,
      ...(input.status && computeRfpDbStatusFilter(input.status)),
    },
    include: {
      author: true,
      _count: {
        select: { proposals: true },
      },
    },
  })

  return rfps.map((rfp) => {
    return {
      ...rfp,
      status: computeRfpProductStatus(rfp.status, rfp.startDate, rfp.endDate),
      submissionCount: rfp._count.proposals,
    } as unknown as Rfp
  })
}
