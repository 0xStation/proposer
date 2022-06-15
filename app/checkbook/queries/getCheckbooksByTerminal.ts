import db from "db"
import * as z from "zod"

const GetCheckbooksByTerminal = z.object({
  terminalId: z.number(),
})

export default async function getCheckbooksByTerminal(
  input: z.infer<typeof GetCheckbooksByTerminal>
) {
  const checkbooks = await db.checkbook.findMany({
    where: {
      terminalId: input.terminalId,
    },
  })

  return checkbooks
}
