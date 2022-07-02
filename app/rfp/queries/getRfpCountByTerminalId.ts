import db from "db"
import * as z from "zod"
import { computeRfpDbAndDeletedStatusFilter } from "../utils"

const GetRfpCountByTerminalId = z.object({
  terminalId: z.number(),
  includeDeletedRfps: z.boolean().optional().default(false),
  statuses: z.string().array().optional(),
})

export async function getRfpCountByTerminalId(input: z.infer<typeof GetRfpCountByTerminalId>) {
  const rfpsWhere = computeRfpDbAndDeletedStatusFilter({
    statuses: input.statuses,
    includeDeletedRfps: input.includeDeletedRfps,
  })

  try {
    const rfpCount = await db.rfp.count({
      where: {
        terminalId: input.terminalId,
        ...rfpsWhere,
      },
    })

    return rfpCount as number
  } catch (err) {
    console.error("Error fetching rfp count. Failed with error: ", err)
    return 0
  }
}

export default getRfpCountByTerminalId
