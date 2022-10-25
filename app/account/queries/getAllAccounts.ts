import db, { AddressType } from "db"
import * as z from "zod"
import { Account } from "../types"
import { PAGINATION_TAKE } from "app/core/utils/constants"

const GetAllAccounts = z.object({
  sortUpdatedAt: z.boolean().optional(),
  filterAddressType: z.enum([AddressType.WALLET, AddressType.SAFE]).optional(),
  page: z.number().optional().default(0),
  paginationTake: z.number().optional().default(PAGINATION_TAKE),
})

export default async function getAllAccounts(input: z.infer<typeof GetAllAccounts>) {
  const params = GetAllAccounts.parse(input)

  const [accounts, count] = await db.$transaction([
    db.account.findMany({
      ...(params.sortUpdatedAt && {
        orderBy: {
          updatedAt: "desc",
        },
      }),
      ...(params.filterAddressType && {
        where: {
          addressType: params.filterAddressType,
        },
      }),
      take: input.paginationTake,
      skip: input.page * input.paginationTake,
    }),
    db.account.count({
      ...(params.filterAddressType && {
        where: {
          addressType: params.filterAddressType,
        },
      }),
    }),
  ])

  return {
    accounts,
    count,
  } as {
    accounts: Account[]
    count: number
  }
}
