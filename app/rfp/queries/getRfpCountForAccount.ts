import db from "db"
import * as z from "zod"
import { Rfp } from "../types"

const GetRfpCountForAccount = z.object({
  address: z.string(),
  // statuses: z.any().array().optional(),
})

export default async function getRfpCountForAccount(input: z.infer<typeof GetRfpCountForAccount>) {
  const params = GetRfpCountForAccount.parse(input)

  const count = db.rfp.count({
    where: {
      accountAddress: params.address,
    },
  })

  return count
}
