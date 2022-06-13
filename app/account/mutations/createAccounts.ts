import db from "db"
import * as z from "zod"

const accountObject = z.object({
  name: z.string(),
  discordId: z.string().optional(),
  avatarHash: z.string().optional(),
  tags: z.number().array(),
  joinedAt: z.string(),
})

const CreateAccounts = z.object({
  terminalId: z.number(),
  users: accountObject.array(),
})

export default async function createAccounts(input: z.infer<typeof CreateAccounts>) {
  const params = CreateAccounts.parse(input)

  params.users.forEach(async (user) => {
    const account = await db.account.upsert({
      where: { discordId: user.discordId },
      update: {},
      create: {
        discordId: user.discordId,
        data: {
          name: user.name,
          pfpURL: user.avatarHash
            ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatarHash}.png`
            : undefined,
        },
      },
    })

    const ticket = await db.accountTerminal.upsert({
      where: { accountId_terminalId: { accountId: account.id, terminalId: params.terminalId } },
      update: {
        tags: {
          connectOrCreate: user.tags.map((tagId) => {
            return {
              where: {
                tagId_ticketAccountId_ticketTerminalId: {
                  tagId: tagId,
                  ticketAccountId: account.id,
                  ticketTerminalId: params.terminalId,
                },
              },
              create: {
                tagId: tagId,
              },
            }
          }),
        },
      },
      create: {
        accountId: account.id,
        terminalId: params.terminalId,
        active: false,
        joinedAt: new Date(user.joinedAt),
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
