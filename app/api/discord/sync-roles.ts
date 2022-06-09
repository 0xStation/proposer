import db from "db"
import { Terminal } from "app/terminal/types"
import { getGuildMembers } from "app/utils/getGuildMembers"

/**
 * API endpoint for "refreshing" roles between discord and station.
 * When a terminal first connects to station, the discord roles and members with those roles are synced.
 * However, it is possible for a discord to get more members, or for roles on discord to change (members lose role etc)
 * So, this function keeps discord and station in sync.
 *
 * Steps:
 * 1. Get guild members for Terminal's connected Discord server
 * 2. Create new accounts for guild members by Discord ID
 * 3. Create new tickets for guild members by Discord ID in this Terminal
 * 4. Take a diff on guild members' roles and accounts' discord-synced tags
 * 5. Give tags to accounts that are not yet reflected in our db
 * 6. Remove tags from accounts that are no longer reflected in Discord
 *
 * @param req - terminalId
 * @param res - 200 or 401
 * @returns {response: "success"}
 */
export default async function handler(req, res) {
  const params = JSON.parse(req.body)

  // Find the terminal we are interested in syncing
  const terminal = (await db.terminal.findUnique({
    where: { id: params.terminalId },
    include: {
      tags: {
        where: {
          active: true,
        },
      },
    },
  })) as unknown as Terminal

  if (!terminal) {
    res.status(401).json({ error: "Terminal not found" })
    return
  }

  if (!terminal.data.guildId) {
    res.status(401).json({ error: "No Discord server for Terminal" })
    return
  }

  let guildMembers
  try {
    guildMembers = await getGuildMembers(terminal.data.guildId)
  } catch (e) {
    console.error(e)
    res.status(500).json({ response: "error", error: e })
    return
  }

  // filter to get the discordIds, which we need to compare to the tags from the discord guild member response
  const activeCreatedTagDiscordIds = terminal.tags.map((tag) => tag.discordId || "")
  // guild members who have one or more of the active tags
  const activeGuildMembers = guildMembers.filter((gm) => {
    return gm.roles.some((r) => activeCreatedTagDiscordIds.includes(r))
  })

  // we need to stash some information that is not saved on the account when it is created
  // this is a handy lookup mapping discord user ids to metadata about that user.
  // specifically, the incoming tags for that user, and the joinedAt data
  const accountDiscordId_metadata = activeGuildMembers.reduce((acc, gm) => {
    const tagOverlap = activeCreatedTagDiscordIds.filter((tag) => gm.roles.includes(tag))

    const tagOverlapId = tagOverlap
      .map((discordId) => {
        const tag = terminal.tags.find((tag) => {
          return tag.discordId === discordId
        })

        return tag?.id
      })
      .filter((tag): tag is number => !!tag) // remove possible undefined from `find` in map above

    acc[gm.user.id] = {
      incomingTagIds: tagOverlapId,
      joinedAt: gm.joined_at,
    }

    return acc
  }, {})

  // step 1.
  // creates an account for the active guild member if one does not exist
  // if one does exist, an empty update map will just skip over this and return the account
  // includes the tickets and tags, which we will need to later when building up which tags to upsert alongside
  // the ticket.

  try {
    await db.account.createMany({
      skipDuplicates: true, // do not create entries that already exist
      data: activeGuildMembers.map((guildMember) => {
        return {
          discordId: guildMember.user.id,
          data: {
            name:
              `${guildMember.user.username}#${guildMember.user.discriminator}` ||
              guildMember.user.nick,
            pfpURL: guildMember.user.avatar
              ? `https://cdn.discordapp.com/avatars/${guildMember.user.id}/${guildMember.user.avatar}.png`
              : undefined,
          },
        }
      }),
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ response: "error", error: "failed creating new accounts" })
    return
  }

  // step 2.
  // create AccountTerminals for accounts that do not yet have membership
  const accounts = await db.account.findMany({
    where: {
      discordId: {
        in: activeGuildMembers.map((gm) => gm.user.id),
      },
    },
    // include tags proactively for step 3
    include: {
      tickets: {
        include: {
          tags: {
            where: {
              tag: { NOT: { discordId: null } }, // omit tags not meant to sync with Discord
            },
          },
        },
      },
    },
  })

  try {
    await db.accountTerminal.createMany({
      skipDuplicates: true, // do not create entries that already exist
      data: accounts.map((a) => {
        return {
          accountId: a.id,
          terminalId: params.terminalId,
          active: false,
          ...(a.discordId && {
            joinedAt: new Date(accountDiscordId_metadata[a.discordId].joinedAt),
          }),
        }
      }),
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ response: "error", error: "failed creating new memberships" })
    return
  }

  // step 3.
  // organize tag diff between db and discord per account
  let addAccountTerminalTags: any[] = []
  let removeAccountTerminalTags: any[] = []

  accounts.forEach((a) => {
    let existingTicket = a.tickets.find((ticket) => ticket.terminalId === params.terminalId)
    const incomingTagIds = accountDiscordId_metadata[a.discordId!].incomingTagIds

    if (!existingTicket) {
      addAccountTerminalTags.concat(
        ...incomingTagIds.map((tagId) => {
          return {
            tagId,
            ticketAccountId: a.id,
            ticketTerminalId: params.terminalId,
          }
        })
      )
    } else {
      const existingTagIds = existingTicket.tags.map((t) => t.tagId)

      const toAdd = incomingTagIds.filter((tagId) => !existingTagIds.includes(tagId))
      addAccountTerminalTags = addAccountTerminalTags.concat(
        ...toAdd.map((tagId) => {
          return {
            tagId,
            ticketAccountId: a.id,
            ticketTerminalId: params.terminalId,
          }
        })
      )

      const toRemove = existingTagIds.filter((tagId) => !incomingTagIds.includes(tagId))
      removeAccountTerminalTags = removeAccountTerminalTags.concat(
        ...toRemove.map((tagId) => {
          return {
            tagId,
            ticketAccountId: a.id,
            ticketTerminalId: params.terminalId,
          }
        })
      )
    }
  })

  // step 3a.
  // create AccountTerminalTags for memberships that are missing tags
  try {
    await db.accountTerminalTag.createMany({
      skipDuplicates: true,
      data: addAccountTerminalTags,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ response: "error", error: "failed creating new tag associations" })
    return
  }

  // step 3b.
  // delete AccountTerminalTags for memberships that have tags in our db that they no longer own in Discord
  try {
    await db.$transaction(
      removeAccountTerminalTags.map((obj) => {
        return db.accountTerminalTag.delete({
          where: {
            tagId_ticketAccountId_ticketTerminalId: {
              ...obj,
            },
          },
        })
      })
    )
  } catch (e) {
    console.error(e)
    res.status(500).json({ response: "error", error: "failed deleting stale tag associations" })
    return
  }

  /** Another option is to use the native `deleteMany`
   *  This takes less code, but for some reason feels weird when I imagine the generated SQL
   *  because all inputs identify a unique row and feels like double-looping versus packing
   *  many unique-deletes into one transaction
   *  const removeTicketTags = db.accountTerminalTag.deleteMany({
   *    where: {
   *      OR: removeAccountTerminalTags,
   *    },
   *  })
   */

  res.status(200).json({ response: "success" })
}
