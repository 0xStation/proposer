import db from "db"
import * as z from "zod"

const GetCheckbookByTerminal = z.object({
  terminalId: z.number(),
})

export default async function getCheckbookByTerminal(
  input: z.infer<typeof GetCheckbookByTerminal>
) {
  const checkbooks = await db.checkbook.findMany({
    where: {
      terminalId: input.terminalId,
    },
  })

  return checkbooks
}
