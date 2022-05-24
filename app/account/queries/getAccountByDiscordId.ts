import db from "db"
import * as z from "zod"
import { Account } from "../types"

const GetAccountByDiscordId = z.object({
  discordId: z.string(),
})

export default async function getAccountByDiscordId(input: z.infer<typeof GetAccountByDiscordId>) {
  const data = GetAccountByDiscordId.parse(input)

  const account = await db.account.findFirst({
    where: { discordId: data.discordId },
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

  return account as Account
}
