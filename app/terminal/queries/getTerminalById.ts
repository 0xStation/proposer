import db, { Terminal } from "db"
import * as z from "zod"

const GetTerminalById = z.object({
  id: z.number(),
})

type TerminalMetadata = {
  name: string
  handle: string
  description: string
}

export default async function getTerminalById(input: z.infer<typeof GetTerminalById>) {
  const data = GetTerminalById.parse(input)
  const terminal = await db.terminal.findFirst({
    where: { id: data.id },
  })
  if (!terminal) {
    return null
  }

  return {
    ...terminal,
    name: terminal.data!["name"],
    handle: terminal.data!["handle"],
    description: terminal.data!["description"],
  } as Terminal & TerminalMetadata
}
