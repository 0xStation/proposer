import db from "db"
import { Account } from "../types"

export default async function getAllAccounts(input: any) {
  const accounts = await db.account.findMany()

  if (!accounts) {
    return []
  }

  return accounts as Account[]
}
