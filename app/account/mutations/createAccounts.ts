import db from "db"
import * as z from "zod"

const accountObject = z.object({
  name: z.string(),
  discordId: z.string().optional(),
  tags: z.number().array(),
})

const CreateAccounts = z.object({
  terminalId: z.number(),
  users: accountObject.array(),
})

export default async function createAccounts(input: z.infer<typeof CreateAccounts>) {
  const params = CreateAccounts.parse(input)

  params.users.forEach(async (user) => {
    const account = await db.account.create({
      data: {
        discordId: user.discordId,
        data: {
          name: user.name,
        },
      },
    })

    const ticket = await db.accountTerminal.create({
      data: {
        accountId: account.id,
        terminalId: params.terminalId,
        active: false,
        tags: {
          create: user.tags.map((tag) => {
            return { tagId: tag }
          }),
        },
      },
    })

    return ticket
  })

  // not sure what return value is useful here... maybe just a regular success / error cycle
  return
}
