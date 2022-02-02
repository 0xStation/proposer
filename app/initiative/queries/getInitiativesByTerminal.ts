import db from "db"
import * as z from "zod"
import { Initiative } from "../types"

const GetInitiativesByTerminal = z.object({
  terminalId: z.number(),
})

export default async function getInitiativesByTerminal(
  input: z.infer<typeof GetInitiativesByTerminal>
) {
  const data = GetInitiativesByTerminal.parse(input)

  const initiatives = await db.initiative.findMany({
    where: { terminalId: data.terminalId },
    include: {
      accounts: {
        select: {
          status: true,
        },
      },
    },
  })

  if (!initiatives) {
    return []
  }

  return initiatives.map((i) => {
    return {
      ...i,
      applicationCount: i.accounts.filter((a) => a.status == "APPLIED").length,
    }
  }) as unknown as Initiative[]
}
