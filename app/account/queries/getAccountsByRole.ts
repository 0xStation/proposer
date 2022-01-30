import db from "db"
import * as z from "zod"
import { Account } from "../types"

const GetAccountByRole = z.object({
  role: z.string(),
})

export default async function getAccountByRole(input: z.infer<typeof GetAccountByRole>) {
  const data = GetAccountByRole.parse(input)
  const accounts = await db.account.findMany({ where: { role: data.role } })

  if (!accounts) {
    return null
  }

  return accounts as Account[]
}
