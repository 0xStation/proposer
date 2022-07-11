import db from "db"
import * as z from "zod"
import { Account, AccountMetadata } from "../types"
import { getEmail } from "app/utils/privy"

const GetAccountByAddress = z.object({
  address: z.string().optional(),
  includeEmail: z.boolean().optional(),
})

export default async function getAccountByAddress(input: z.infer<typeof GetAccountByAddress>) {
  if (!input.address) {
    return null
  }

  // storing email with Privy, not our database, so we need to fetch it directly
  let email
  let emailFetchError
  if (!!input.includeEmail) {
    try {
      email = await getEmail(input.address)
    } catch (e) {
      console.error(e)
      emailFetchError = "Failed to fetch email"
      // error to be used in toasts for user feedback
    }
  }

  const account = await db.account.findFirst({
    where: { address: input.address },
    include: {
      tickets: {
        include: {
          terminal: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      },
    },
  })

  if (!account) {
    return null
  }

  // merge database model with Privy-stored data
  return {
    ...account,
    data: { ...(account.data as AccountMetadata), ...(!!email && { email }) },
    ...(!!emailFetchError && { emailFetchError }),
  } as Account
}
