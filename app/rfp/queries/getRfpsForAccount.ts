import db, { RfpStatus } from "db"
import * as z from "zod"
import { Rfp } from "../types"

const GetRfpsForAccount = z.object({
  address: z.string(),
  page: z.number().optional().default(0),
  paginationTake: z.number().optional().default(25),
  statuses: z.enum([RfpStatus.OPEN, RfpStatus.CLOSED]).array().optional(),
})

export default async function getRfpsForAccount(input: z.infer<typeof GetRfpsForAccount>) {
  const params = GetRfpsForAccount.parse(input)

  const rfps = db.rfp.findMany({
    where: {
      accountAddress: params.address,
      ...(params.statuses &&
        params.statuses.length > 0 && {
          status: {
            in: params.statuses,
          },
        }),
    },
    take: input.paginationTake,
    skip: input.page * input.paginationTake,
  })

  return rfps as unknown as Rfp[]
}
