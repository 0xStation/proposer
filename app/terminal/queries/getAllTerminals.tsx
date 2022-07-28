import { PAGINATION_TAKE } from "app/core/utils/constants"
import db from "db"
import { z } from "zod"

const GetAllTerminals = z.object({
  page: z.number().optional().default(0),
  paginationTake: z.number().optional().default(PAGINATION_TAKE),
})

export async function getAllTerminals(input: z.infer<typeof GetAllTerminals>) {
  try {
    const terminals = await db.terminal.findMany({
      take: input.paginationTake,
      skip: input.page * input.paginationTake,
    })
    return terminals
  } catch (err) {
    console.error("Could not query for terminals. Failed with err: ", err)
    return null
  }
}

export default getAllTerminals
