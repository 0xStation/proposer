import { d } from "@blitzjs/auth/dist/index-57d74361"
import db from "db"
import * as z from "zod"
import { Schedule, ScheduleRepeatPeriod } from "../types"
import { calculateNextRefreshTime } from "../utils"

const UpdateSchedule = z.object({
  scheduleId: z.string(),
  to: z.string(),
  value: z.string(),
  data: z.string(),
  title: z.string(),
  meta: z.any(),
  schedule: z.object({
    startDate: z.date(),
    repeatFrequency: z.number(),
    repeatPeriod: z.enum([
      ScheduleRepeatPeriod.WEEKS,
      ScheduleRepeatPeriod.MONTHS,
      ScheduleRepeatPeriod.MINUTES,
    ]),
    maxCount: z.number().optional(),
  }),
})

export default async function updateSchedule(input: z.infer<typeof UpdateSchedule>) {
  const params = UpdateSchedule.parse(input)

  const schedule = await db.schedule.findUnique({
    where: {
      id: params.scheduleId,
    },
  })

  if (!schedule) {
    throw Error("no schedule found")
  }

  const newSchedule = await db.schedule.update({
    where: {
      id: params.scheduleId,
    },
    data: {
      data: {
        title: params.title,
        meta: params.meta,
        txn: {
          to: params.to,
          value: params.value,
          data: params.data,
        },
        startDate: params.schedule.startDate.toJSON(),
        repeatFrequency: params.schedule.repeatFrequency,
        repeatPeriod: params.schedule.repeatPeriod,
        maxCount: params.schedule.maxCount,
      },
      nextRefreshAt:
        params.schedule.maxCount && schedule.counter >= params.schedule.maxCount
          ? null
          : calculateNextRefreshTime({
              frequency: params.schedule.repeatFrequency,
              period: params.schedule.repeatPeriod,
              lastRefreshedAt: new Date(),
            }),
    },
  })

  return newSchedule as unknown as Schedule
}
