import { verifySignature } from "@upstash/qstash/nextjs"
import { Schedule } from "app/schedule/types"
import { calculateNextRefreshTime } from "app/schedule/utils"
import db from "db"

async function handler(req, res) {
  const now = new Date()

  const queuedSchedules = (await db.schedule.findMany({
    where: {
      nextRefreshAt: { lte: now },
    },
    orderBy: { nextRefreshAt: "asc" }, // oldest ones first
  })) as unknown as Schedule[]

  console.log("queuedSchedules", queuedSchedules)

  await queuedSchedules.forEach(async (schedule) => {
    await db.$transaction(async (db) => {
      const highestNonceCheck = await db.check.findFirst({
        where: {
          chainId: schedule.chainId,
          address: schedule.address,
        },
        orderBy: {
          nonce: "desc",
        },
      })
      // create new check
      await db.check.create({
        data: {
          scheduleId: schedule.id,
          chainId: schedule.chainId,
          address: schedule.address,
          nonce: (highestNonceCheck?.nonce || 0) + 1,
          data: {
            title: schedule.data.title,
            meta: schedule.data.meta,
            txn: schedule.data.txn,
          },
        },
      })
      // update schedule and set next refresh time
      const counterReached =
        schedule.data.maxCount && schedule.counter + 1 >= schedule.data.maxCount
      await db.schedule.update({
        where: {
          id: schedule.id,
        },
        data: {
          counter: schedule.counter + 1,
          nextRefreshAt: counterReached
            ? null
            : calculateNextRefreshTime({
                frequency: schedule.data.repeatFrequency,
                period: schedule.data.repeatPeriod,
                lastRefreshedAt: now,
              }),
        },
      })
    })
  })

  res.status(200).end()
}

export default verifySignature(handler)

export const config = {
  api: {
    bodyParser: false,
  },
}
