import db from "db"
import * as z from "zod"

const GetAccountByAddress = z.object({
  address: z.string(),
})

export default async function getAccountByAddress(input: z.infer<typeof GetAccountByAddress>) {
  const data = GetAccountByAddress.parse(input)
  const address = await db.account.findFirst({ where: { address: data.address } })

  return address
}
