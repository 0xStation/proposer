import db from "db"
import * as z from "zod"

const GetTerminalById = z.object({
  id: z.number(),
})

export default async function getTerminalById(input: z.infer<typeof GetTerminalById>) {
  const data = GetTerminalById.parse(input)
  const terminal = await db.terminal.findFirst({ where: { id: data.id } })

  return terminal
}
