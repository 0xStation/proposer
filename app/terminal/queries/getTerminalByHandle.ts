import db from "db"
import * as z from "zod"
import { Terminal } from "app/terminal/types"

const GetTerminalByHandle = z.object({
  handle: z.string(),
  include: z.string().array().optional(),
})

export default async function getTerminalByHandle(input: z.infer<typeof GetTerminalByHandle>) {
  const include = {
    tags: true,
  }
  input.include?.forEach((key) => {
    include[key] = true
  })
  const terminal = await db.terminal.findFirst({
    where: {
      handle: {
        equals: input.handle,
        mode: "insensitive",
      },
    },
    include,
  })

  if (!terminal) {
    return null
  }

  // if anyone knows why ts isn't picking up on the metadata conversion lmk
  // I cant figure it out so going for this suggested workaround
  return terminal as unknown as Terminal
}
