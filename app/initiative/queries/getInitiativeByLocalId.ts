import db from "db"
import * as z from "zod"
import { Initiative, InitiativeMetadata } from "../types"
import { Role } from "app/role/types"

const GetInitiativeByLocalId = z.object({
  terminalId: z.number(),
  localId: z.number(),
})

export default async function getInitiativeByLocalId(
  input: z.infer<typeof GetInitiativeByLocalId>
) {
  const data = GetInitiativeByLocalId.parse(input)
  const initiative = await db.initiative.findUnique({
    where: { terminalId_localId: { terminalId: data.terminalId, localId: data.localId } },
    include: {
      accounts: {
        include: {
          account: {
            include: {
              tickets: {
                where: {
                  terminalId: data.terminalId,
                },
                select: {
                  role: true,
                  joinedAt: true,
                },
              },
              skills: {
                include: {
                  skill: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!initiative) {
    return null
  }

  return {
    id: initiative.id,
    localId: initiative.localId,
    data: initiative.data as InitiativeMetadata,
    contributors: initiative.accounts
      .filter((a) => a.status == "CONTRIBUTOR")
      .map((a) => {
        return {
          ...a.account,
          role: (a.account.tickets[0]?.role as Role)?.data.value,
          joinedAt: a.account.tickets[0]?.joinedAt,
          skills: a.account.skills.map(({ skill }) => skill.name),
        }
      }),
  } as Initiative
}
