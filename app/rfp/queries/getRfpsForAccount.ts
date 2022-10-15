import db from "db"
import * as z from "zod"
import { Rfp } from "../types"

const GetRfpsForAccount = z.object({
  address: z.string(),
})

export default async function getRfpsForAccount(input: z.infer<typeof GetRfpsForAccount>) {
  const params = GetRfpsForAccount.parse(input)

  const rfps = db.rfp.findMany({
    where: {
      accountAddress: params.address,
    },
  })

  return rfps as unknown as Rfp
}
