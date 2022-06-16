import db from "db"
import * as z from "zod"

const CreateCheckbook = z.object({
  terminalId: z.number(),
  address: z.string(),
  chainId: z.number(),
  name: z.string(),
})

export default async function getCheckbooksByTerminal(input: z.infer<typeof CreateCheckbook>) {
  const checkbook = await db.checkbook.create({
    data: {
      ...input,
      data: {},
    },
  })

  return checkbook
}
