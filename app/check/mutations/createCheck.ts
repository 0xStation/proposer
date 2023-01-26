import { ScheduleRepeatPeriod } from "app/schedule/types"
import db from "db"
import * as z from "zod"
import { Check } from "../types"

const CreateCheck = z.object({
  inboxId: z.string().optional(),
  chainId: z.number(),
  address: z.string(),
  to: z.string(),
  value: z.string(),
  data: z.string(),
  title: z.string(),
  meta: z.any(),
  schedule: z
    .object({
      startDate: z.date(),
      repeatFrequency: z.number(),
      repeatPeriod: z.enum([
        ScheduleRepeatPeriod.WEEKS,
        ScheduleRepeatPeriod.MONTHS,
        // ScheduleRepeatPeriod.MINUTES, // uncomment for testing
      ]),
      maxCount: z.number().optional(),
    })
    .optional(),
})

export default async function createCheck(input: z.infer<typeof CreateCheck>) {
  const params = CreateCheck.parse(input)

  // auth a signature from safe signer

  const check = await db.$transaction(async (db) => {
    const highestNonceCheck = await db.check.findFirst({
      where: {
        chainId: params.chainId,
        address: params.address,
      },
      orderBy: {
        nonce: "desc",
      },
    })

    let scheduleId
    if (params.schedule) {
      const schedule = await db.schedule.create({
        data: {
          chainId: params.chainId,
          address: params.address,
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
          nextRefreshAt: params.schedule.startDate,
        },
      })
      scheduleId = schedule.id
    }

    const newCheck = await db.check.create({
      data: {
        inboxId: params.inboxId,
        scheduleId: scheduleId,
        chainId: params.chainId,
        address: params.address,
        nonce: (highestNonceCheck?.nonce || 0) + 1,
        data: {
          title: params.title,
          meta: params.meta,
          txn: {
            to: params.to,
            value: params.value,
            data: params.data,
          },
        },
      },
    })

    return newCheck
  })

  return check as unknown as Check
}
