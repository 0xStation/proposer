import db from "db"
import * as z from "zod"
import { Rfp } from "../types"

const GetRfpsForAccount = z.object({
  address: z.string(),
  // statuses: z.any().array().optional(),
  page: z.number().optional().default(0),
  paginationTake: z.number().optional().default(25),
})

export default async function getRfpsForAccount(input: z.infer<typeof GetRfpsForAccount>) {
  const params = GetRfpsForAccount.parse(input)

  const rfps = db.rfp.findMany({
    where: {
      accountAddress: params.address,
    },
    take: input.paginationTake,
    skip: input.page * input.paginationTake,
  })

  return rfps as unknown as Rfp[]
}
