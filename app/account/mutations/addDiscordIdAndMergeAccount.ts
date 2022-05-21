import db from "db"
import * as z from "zod"
import { Account } from "../types"

const AddDiscordIdAndMergeAccount = z.object({
  accountId: z.number(),
  discordId: z.string(),
})

export default async function addDiscordIdAndMergeAccount(
  input: z.infer<typeof AddDiscordIdAndMergeAccount>
) {
  const params = AddDiscordIdAndMergeAccount.parse(input)

  const importedAccount = await db.account.findFirst({
    where: { discordId: params.discordId },
  })

  const importedAccountId = importedAccount?.id

  if (importedAccount?.id === params.accountId) {
    // The account is already connected. Don't do anything
    return importedAccount
  }

  if (!importedAccount) {
    // if account doesn't exist, then the account hasn't been imported before.
    // Add discordId to existing account.

    try {
      const updatedAccount = await db.account.update({
        where: {
          id: params.accountId,
        },
        data: {
          discordId: params.discordId,
        },
      })

      return updatedAccount
    } catch (err) {
      console.error("Could not add Discord Id to account. Failed with error: ", err)
      throw err
    }
  }

  // else we need to grab the id account and merge it with the discord account
  const userCreatedAccount = await db.account.findFirst({
    where: { id: params.accountId },
  })

  // merge the two accounts where userCreatedAccount is the source
  const mergedAccount = {
    ...importedAccount,
    ...userCreatedAccount,
    discordId: params.discordId,
    data: {
      ...(importedAccount?.data as object),
      ...(userCreatedAccount?.data as object),
    },
  }

  try {
    // rollback if any of these calls fail
    // https://www.prisma.io/docs/concepts/components/prisma-client/transactions#the-transaction-api
    await db.$transaction(async (db) => {
      // erase the discordId since there is a unique constraint on discordId, but don't delete the account yet
      await db.account.update({
        where: {
          discordId: params.discordId,
        },
        data: {
          discordId: null,
        },
      })

      // update the user-created account with discord id + other info
      const mAccount = await db.account.update({
        where: {
          id: params.accountId,
        },
        data: mergedAccount,
      })

      const accountTerminals = await db.accountTerminal.findMany({
        where: { accountId: importedAccountId as number },
        include: { tags: true },
      })

      accountTerminals.forEach(async (membership) => {
        await db.accountTerminal.upsert({
          where: {
            accountId_terminalId: {
              accountId: mAccount?.id as number,
              terminalId: membership.terminalId,
            },
          },
          update: {
            tags: {
              connectOrCreate: membership.tags.map((membershipTag) => {
                return {
                  where: {
                    tagId_ticketAccountId_ticketTerminalId: {
                      tagId: membershipTag.tagId,
                      ticketAccountId: mAccount?.id,
                      ticketTerminalId: membership.terminalId,
                    },
                  },
                  create: {
                    tagId: membershipTag.tagId,
                  },
                }
              }),
            },
          },
          create: {
            accountId: mAccount?.id,
            terminalId: membership.terminalId,
            tags: {
              create: membership.tags.map((membershipTag) => {
                return {
                  tagId: membershipTag.tagId,
                }
              }),
            },
          },
        })
      })

      // all other records should be automatically deleted with the
      // on `onDelete: Cascade` propoerty found in `schema.prisma`
      // ref: https://www.prisma.io/docs/concepts/components/prisma-schema/relations/referential-actions
      await db.account.delete({
        where: {
          id: importedAccountId,
        },
      })

      return mAccount
    })
  } catch (err) {
    console.error(err)
  }

  return importedAccount as Account
}
