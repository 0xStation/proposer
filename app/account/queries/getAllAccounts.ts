import db from "db"
import * as z from "zod"
import { Account } from "../types"
import { PAGINATION_TAKE } from "app/core/utils/constants"

const GetAllAccounts = z.object({
  sortUpdatedAt: z.boolean().optional(),
  page: z.number().optional().default(0),
  paginationTake: z.number().optional().default(PAGINATION_TAKE),
})

export default async function getAllAccounts(input: z.infer<typeof GetAllAccounts>) {
  const params = GetAllAccounts.parse(input)

  const accounts = await db.account.findMany({
    ...(params.sortUpdatedAt && {
      orderBy: {
        updatedAt: "desc",
      },
    }),
    take: input.paginationTake,
    skip: input.page * input.paginationTake,
  })

  return accounts as Account[]
}
