import db from "db"
import * as z from "zod"
import { Account } from "../types"

const GetAccountsByAddresses = z.object({
  addresses: z.array(z.string()),
})

export default async function getAccountsByAddresses(
  input: z.infer<typeof GetAccountsByAddresses>
) {
  const data = GetAccountsByAddresses.parse(input)
  const accounts = await db.account.findMany({ where: { address: { in: data.addresses } } })

  if (!accounts) {
    return []
  }

  return accounts as Account[]
}
