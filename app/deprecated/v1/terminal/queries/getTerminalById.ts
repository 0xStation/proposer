import db from "db"
import * as z from "zod"
import { Terminal } from "../../../../terminal/types"

const GetTerminalById = z.object({
  id: z.number(),
})

export default async function getTerminalById(input: z.infer<typeof GetTerminalById>) {
  const data = GetTerminalById.parse(input)
  const terminal = await db.terminal.findFirst({
    where: { id: data.id },
    include: { roles: true },
  })
  if (!terminal) {
    return null
  }

  return terminal as Terminal
}
