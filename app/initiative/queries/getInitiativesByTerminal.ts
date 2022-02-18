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
        include: {
          account: true,
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
      contributors: i.accounts
        .filter((a) => a.status == "CONTRIBUTOR")
        .map((a) => {
          return {
            ...a.account,
          }
        }),
    }
  }) as unknown as Initiative[]
}
