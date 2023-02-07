import db from "db"
import * as z from "zod"
import { Schedule, SchedulePeriodUnit } from "../types"
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
    periodCoefficient: z.number(),
    periodUnit: z.enum([
      SchedulePeriodUnit.WEEK,
      SchedulePeriodUnit.MONTH,
      SchedulePeriodUnit.MINUTE, // uncomment for testing
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
        periodCoefficient: params.schedule.periodCoefficient,
        periodUnit: params.schedule.periodUnit,
        maxCount: params.schedule.maxCount,
      },
      nextRefreshAt:
        // schedule has not hit first refresh -> next refresh at start date
        !schedule.lastRefreshMarker
          ? params.schedule.startDate
          : // schedule has max count and count has been reached -> no next refresh
          params.schedule.maxCount && schedule.counter >= params.schedule.maxCount
          ? null
          : // calculate next refresh time
            calculateNextRefreshTime({
              periodCoefficient: params.schedule.periodCoefficient,
              periodUnit: params.schedule.periodUnit,
              lastRefreshMarker: schedule.lastRefreshMarker,
            }),
    },
  })

  return newSchedule as unknown as Schedule
}
