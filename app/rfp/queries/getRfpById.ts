import db from "db"
import * as z from "zod"
import { computeRfpProductStatus } from "../utils"

const GetRfpByLocalId = z.object({
  terminalId: z.number(),
  localId: z.number(),
})

export default async function getRfpsByLocalId(input: z.infer<typeof GetRfpByLocalId>) {
  const rfps = await db.rfp.findMany({
    where: {
      terminalId: input.terminalId,
      localId: input.localId,
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
      status: computeRfpProductStatus(rfp.status, rfp.startDate, rfp.endDate),
      submissionCount: rfp._count.proposals,
    }
  })
}
