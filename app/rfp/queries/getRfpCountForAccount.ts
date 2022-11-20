import db, { RfpStatus } from "db"
import * as z from "zod"
import { Rfp } from "../types"
import { computeRfpDbStatusFilter } from "../utils"

const GetRfpCountForAccount = z.object({
  address: z.string(),
  statuses: z.enum([RfpStatus.OPEN, RfpStatus.CLOSED]).array().optional(),
})

export default async function getRfpCountForAccount(input: z.infer<typeof GetRfpCountForAccount>) {
  const params = GetRfpCountForAccount.parse(input)

  const count = db.rfp.count({
    where: {
      accountAddress: params.address,
      ...(params.statuses &&
        params.statuses.length > 0 && {
          OR: params.statuses.map((status) => computeRfpDbStatusFilter(status)),
        }),
    },
  })

  return count
}
