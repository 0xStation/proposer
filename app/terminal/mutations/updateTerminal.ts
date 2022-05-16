import db from "db"
import * as z from "zod"
import { Terminal } from "../types"

const UpdateTerminal = z.object({
  id: z.number(),
  name: z.string().optional(),
  handle: z.string().optional(),
  pfpURL: z.string().optional(),
  guildId: z.string().optional(),
})

export default async function updateTerminal(input: z.infer<typeof UpdateTerminal>) {
  const params = UpdateTerminal.parse(input)

  const existingTerminal = (await db.terminal.findUnique({
    where: { id: params.id },
  })) as Terminal

  if (!existingTerminal) {
    console.log("cannot update a terminal that does not exist")
    return null
  }

  const payload = {
    data: {
      ...existingTerminal.data,
      ...(params.pfpURL && { pfpURL: params.pfpURL }),
      ...(params.name && { name: params.name }),
      ...(params.guildId && { guildId: params.guildId }),
    },
    ...(params.handle && { handle: params.handle }),
  }

  try {
    const terminal = await db.terminal.update({
      where: { id: params.id },
      data: payload,
    })

    return terminal
  } catch (err) {
    throw err
  }
}
