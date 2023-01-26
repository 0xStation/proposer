import db from "db"
import * as z from "zod"
import { Schedule } from "../types"

const GetSchedule = z.object({
  scheduleId: z.string(),
})

export default async function getSchedule(input: z.infer<typeof GetSchedule>) {
  const params = GetSchedule.parse(input)

  const schedule = await db.schedule.findUnique({
    where: {
      id: params.scheduleId,
    },
    include: {
      checkbook: true,
    },
  })

  if (!schedule) return null

  return schedule as unknown as Schedule
}
