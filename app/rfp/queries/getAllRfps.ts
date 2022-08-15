import { PAGINATION_TAKE } from "app/core/utils/constants"
import db from "db"
import { z } from "zod"
import { Rfp } from "../types"
import { Terminal } from "app/terminal/types"
import { computeRfpProductStatus } from "../utils"

interface RfpWithTerminal extends Rfp {
  terminal: Terminal
}

const GetAllRfps = z.object({
  page: z.number().optional().default(0),
  paginationTake: z.number().optional().default(PAGINATION_TAKE),
})

export async function getAllRfps(input: z.infer<typeof GetAllRfps>) {
  try {
    const rfps = await db.rfp.findMany({
      take: input.paginationTake,
      skip: input.page * input.paginationTake,
      include: {
        author: true,
        terminal: true,
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
    }) as unknown as RfpWithTerminal[]
  } catch (err) {
    console.error("Could not query for rfps. Failed with err: ", err)
    return null
  }
}

export default getAllRfps
