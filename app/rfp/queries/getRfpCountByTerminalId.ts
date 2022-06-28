import db from "db"
import * as z from "zod"
import { RfpStatus as PrismaRfpStatus } from "@prisma/client"

const GetRfpCountByTerminalId = z.object({
  terminalId: z.number(),
  includeDeletedRfps: z.boolean().optional().default(false),
})

export async function getRfpCountByTerminalId(input: z.infer<typeof GetRfpCountByTerminalId>) {
  const removeDeletedStatusFilter = input.includeDeletedRfps
    ? {}
    : {
        NOT: [
          {
            status: PrismaRfpStatus.DELETED,
          },
        ],
      }
  try {
    const rfpCount = await db.rfp.count({
      where: {
        terminalId: input.terminalId,
        ...removeDeletedStatusFilter,
      },
    })

    return rfpCount as number
  } catch (err) {
    console.error("Error fetching rfp count. Failed with error: ", err)
    return 0
  }
}

export default getRfpCountByTerminalId
