import db from "db"
import * as z from "zod"

const GetRfpCountByTerminalId = z.object({
  terminalId: z.number(),
})

export async function getRfpCountByTerminalId(input: z.infer<typeof GetRfpCountByTerminalId>) {
  try {
    const rfpCount = await db.rfp.count({
      where: {
        terminalId: input.terminalId,
      },
    })

    return rfpCount as number
  } catch (err) {
    console.error("Error fetching rfp count. Failed with error: ", err)
    return 0
  }
}

export default getRfpCountByTerminalId
