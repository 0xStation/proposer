import { AccountTerminalMetadata } from "app/accountTerminal/types"
import db from "db"
import * as z from "zod"
import { Ctx } from "blitz"
import { Account } from "../types"

const AddDiscordIdAndMergeAccount = z.object({
  accountId: z.number(),
  discordId: z.string(),
})

// This mutation is called when a user connects to discord.
// Connecting an account means adding a discord id to the user's `Account`.
// The discordId column is a unique column, so only one account can exist with the id
// at a time.

// The mutation handles the following cases:
// 1. If the user already has a discord id on their `Account`, it means
// they are already connected, so we don't need to do anything.

// 2. If an account doesn't exist with a discord id, that means the user hasn't
// connected before and a terminal has never imported the user from discord before.
// In this case, we update the user's account to include the discord id.

// 3. If the user doesn't have a discord id on their Account, but an account
// already exists with the discord id AND the account has an address, that means
// the discord info is already connected to a different user-created account.
// The user needs to disconnect from the other user-created account first.

// 4. The last handled case is if an account has been created with the user's discord id
// when the terminal imported discord accounts and the user is connecting their account
// for the first time. Here we need to merge the accounts and delete the imported account.
export default async function addDiscordIdAndMergeAccount(
  input: z.infer<typeof AddDiscordIdAndMergeAccount>,
  ctx: Ctx
) {
  const params = AddDiscordIdAndMergeAccount.parse(input)

  const existingAccount = (await db.account.findUnique({
    where: {
      id: params.accountId,
    },
  })) as Account

  if (!existingAccount) {
    console.error("cannot update an account that does not exist")
    return null
  }

  ctx.session.$authorize([], [existingAccount.id])

  let importedAccount
  try {
    importedAccount = await db.account.findFirst({
      where: { discordId: params.discordId },
    })
  } catch (err) {
    console.error("Could not retrieve account with Discord Id. Failed with error: ", err)
    throw err
  }

  const importedAccountId = importedAccount?.id

  // 1. The account is already connected. Don't do anything and return
  // the queried account.
  if (importedAccountId === params.accountId) {
    return importedAccount
  }

  // 2. If account doesn't exist, then the account hasn't been imported before.
  // Add discord id to existing account.
  if (!importedAccount) {
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

  // 3. If the discord account is already connected to a different Station account
  // then we don't want to delete the Station account. Instead, the user should have
  // a way to disconnect their Station account from their Discord account.
  // The presence of an address indicates that it is a user-created account.
  if (importedAccount.address) {
    const errorMessage = "The Discord account is already connected to another Station account."
    console.warn(errorMessage)
    throw Error(errorMessage)
  }

  // 4. Else, we need to grab the user-created account and merge it with the imported account.
  const userCreatedAccount = await db.account.findFirst({
    where: { id: params.accountId },
  })

  // Merge the two accounts where userCreatedAccount is the source.
  // TODO: deepmerge this using lodash's `mergeWith`
  const mergedAccountMetadata = {
    ...importedAccount,
    ...userCreatedAccount,
    discordId: params.discordId,
    data: {
      ...(importedAccount?.data as object),
      ...(userCreatedAccount?.data as object),
    },
  }

  try {
    // Prisma's `$transaction` api rollbacks if any of the calls fail within the callback.
    // https://www.prisma.io/docs/concepts/components/prisma-client/transactions#the-transaction-api
    await db.$transaction(async (db) => {
      // Remove the discordId from the imported account since there is a
      // unique constraint on `discordId`, but don't delete the account yet
      // because we need the imported account's `accountTerminal` and deleting
      // the account will cascade delete the related tables.
      await db.account.update({
        where: {
          discordId: params.discordId,
        },
        data: {
          discordId: null,
        },
      })

      // Update the user-created account with discord id + other info.
      const mergedAccount = await db.account.update({
        where: {
          id: params.accountId,
        },
        data: mergedAccountMetadata,
      })

      const accountTerminals = await db.accountTerminal.findMany({
        where: { accountId: importedAccountId as number },
        include: { tags: true },
      })

      // Create discord-related tags for user-created account.
      accountTerminals.forEach(async (membership) => {
        await db.accountTerminal.upsert({
          where: {
            accountId_terminalId: {
              accountId: mergedAccount?.id as number,
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
                      ticketAccountId: mergedAccount?.id,
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
            accountId: mergedAccount?.id,
            terminalId: membership.terminalId,
            joinedAt: membership.joinedAt,
            ...(membership.data && { data: membership.data as AccountTerminalMetadata }), // throws error if pass in `data: null`
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

      // Once the imported account is deleted, all other records
      // should be automatically deleted with the `onDelete: Cascade`
      // property found in `schema.prisma`.
      // Ref: https://www.prisma.io/docs/concepts/components/prisma-schema/relations/referential-actions
      await db.account.delete({
        where: {
          id: importedAccountId,
        },
      })

      return mergedAccount
    })
  } catch (err) {
    console.error(
      "Error could not merge imported account with user's account. Failed with error: ",
      err
    )
    throw err
  }

  return importedAccount as Account
}
