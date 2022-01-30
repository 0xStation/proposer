import db from "db"
import * as z from "zod"
import { Terminal } from "../types"

const GetTerminalByHandle = z.object({
  handle: z.string(),
})

export default async function getTerminalByHandle(input: z.infer<typeof GetTerminalByHandle>) {
  const data = GetTerminalByHandle.parse(input)
  const terminal = await db.terminal.findFirst({
    where: { handle: data.handle },
  })
  if (!terminal) {
    return null
  }

  return terminal as Terminal
}
