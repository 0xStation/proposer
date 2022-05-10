import db from "db"
import * as z from "zod"
import { Terminal } from "../types"

const CreateTerminal = z.object({
  name: z.string(),
  handle: z.string(),
  pfpURL: z.string().optional(),
})

export default async function createTerminal(input: z.infer<typeof CreateTerminal>) {
  const params = CreateTerminal.parse(input)

  const payload = {
    data: {
      pfpURL: params.pfpURL,
      name: params.name,
    },
    handle: params.handle,
  }

  try {
    const terminal = (await db.terminal.create({ data: payload })) as Terminal
    return terminal
  } catch (err) {
    throw err
  }
}
