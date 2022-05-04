import db from "db"
import * as z from "zod"
import { Terminal } from "app/deprecated/v1/terminal/types"

const GetTerminalByHandle = z.object({
  handle: z.string(),
})

export default async function getTerminalByHandle(input: z.infer<typeof GetTerminalByHandle>) {
  const data = GetTerminalByHandle.parse(input)
  const terminal = await db.terminal.findFirst({
    where: {
      handle: {
        equals: data.handle,
        mode: "insensitive",
      },
    },
    include: {
      roles: true,
      tags: true,
    },
  })
  if (!terminal) {
    return null
  }

  // if anyone knows why ts isn't picking up on the metadata conversion lmk
  // I cant figure it out so going for this suggested workaround
  return terminal as unknown as Terminal
}
