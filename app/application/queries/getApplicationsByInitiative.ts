import db from "db"
import * as z from "zod"
import { Application } from "../types"

const GetApplicationsByInitiative = z.object({
  initiativeId: z.number(),
  terminalId: z.number(),
})

export default async function getApplicationsByInitiative(
  input: z.infer<typeof GetApplicationsByInitiative>
) {
  const data = GetApplicationsByInitiative.parse(input)
  const { initiativeId, terminalId } = data

  // get all applications for the initiative
  const applications = await db.accountInitiative.findMany({
    where: { initiativeId: initiativeId, status: "INTERESTED" },
    include: {
      account: {
        include: {
          tickets: {
            where: {
              terminalId: terminalId,
            },
            include: {
              role: true,
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
  })

  return applications as unknown as Application[]
}
