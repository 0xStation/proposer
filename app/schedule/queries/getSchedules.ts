import db from "db"
import * as z from "zod"
import { Schedule } from "../types"

const GetSchedules = z.object({
  chainId: z.number(),
  address: z.string(),
})

export default async function getSchedules(input: z.infer<typeof GetSchedules>) {
  const params = GetSchedules.parse(input)

  console.log("params", params)

  const schedules = await db.schedule.findMany({
    where: {
      chainId: params.chainId,
      address: params.address,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  if (!schedules) return []

  return schedules as unknown as Schedule[]
}
