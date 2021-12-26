import db from "db"
import * as z from "zod"

const GetTerminalByName = z.object({
  name: z.string(),
})

export default async function getTerminalByName(input: z.infer<typeof GetTerminalByName>) {
  const data = GetTerminalByName.parse(input)
  const terminal = await db.terminal.findFirst({ where: { name: data.name } })

  return terminal
}
