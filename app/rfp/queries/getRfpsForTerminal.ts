import db from "db"
import * as z from "zod"
import { statusToFilter, computeStatus } from "../utils"

const GetRfpsByTerminalId = z.object({
  terminalId: z.number(),
  status: z.string().optional(),
})

export default async function getRfpsByTerminalId(input: z.infer<typeof GetRfpsByTerminalId>) {
  const rfps = await db.rfp.findMany({
    where: {
      terminalId: input.terminalId,
      ...(input.status && statusToFilter(input.status)),
    },
    include: {
      _count: {
        select: { proposals: true },
      },
    },
  })

  return rfps.map((rfp) => {
    return {
      ...rfp,
      status: computeStatus(rfp.status, rfp.startDate, rfp.endDate),
      submissionCount: rfp._count.proposals,
    }
  })
}
