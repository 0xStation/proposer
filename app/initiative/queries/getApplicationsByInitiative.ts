import db from "db"
import * as z from "zod"
import { Initiative } from "../types"

const GetApplicationsByInitiative = z.object({
  initiativeId: z.number(),
})

export default async function getApplicationsByInitiative(
  input: z.infer<typeof GetApplicationsByInitiative>
) {
  const data = GetApplicationsByInitiative.parse(input)
  const applications = await db.initiativeApplication.findMany({
    where: { initiativeId: data.initiativeId },
  })
  if (!applications) {
    return []
  }

  return applications as []
}
