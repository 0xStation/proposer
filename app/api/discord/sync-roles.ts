import db from "db"
import { Terminal } from "app/terminal/types"

/**
 * API endpoint for "refreshing" roles between discord and station.
 * When a terminal first connects to station, the discord roles and members with those roles are synced.
 * However, it is possible for a discord to get more members, or for roles on discord to change (members lose role etc)
 * So, this function keeps discord and station in sync.
 *
 * @param req - terminalId
 * @param res - 200 or 401
 * @returns {response: "success"}
 */
export default async function handler(req, res) {
  const params = JSON.parse(req.body)
  console.log(params)

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

  const fetchGuildMembers = async (after) => {
    const limit = 1000
    const baseURL = `${process.env.BLITZ_PUBLIC_API_ENDPOINT}/guilds/${terminal.data.guildId}/members?limit=${limit}`
    const url = after ? baseURL + `&after=${after}` : baseURL
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
    })
    const results = await response.json()

    if (results.code !== undefined) {
      throw results.message
    }

    // anything less than 1000 means this was final page, return results
    return results
  }

  let guildMembers: any[] = []
  let afterId
  let retry = true
  try {
    while (retry) {
      const nextPage = await fetchGuildMembers(afterId)
      if (nextPage.length < 1000) {
        retry = false
      }
      guildMembers = guildMembers.concat(...nextPage)
      const num = guildMembers.length - 1
      afterId = guildMembers[num].user.id
    }
  } catch (err) {
    console.error(err)
    res.status(401).json({ error: err })
    return
  }

  // filter to get the discordIds, which we need to compare to the tags from the discord guild member response
  const activeCreatedTagDiscordIds = terminal.tags.map((tag) => tag.discordId || "")
  // guild members who have one or more of the active tags
  const activeGuildMembers = guildMembers.filter((gm) => {
    return gm.roles.some((r) => activeCreatedTagDiscordIds.includes(r))
  })

  console.log(guildMembers.length)
  console.log(activeGuildMembers.length)

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

  const newAccounts = await db.account.createMany({
    skipDuplicates: true,
    data: activeGuildMembers.map((guildMember) => {
      return {
        discordId: guildMember.user.id,
        data: {
          name: guildMember.nick || guildMember.user.username,
          pfpURL: guildMember.user.avatar
            ? `https://cdn.discordapp.com/avatars/${guildMember.user.id}/${guildMember.user.avatar}.png`
            : undefined,
        },
      }
    }),
  })

  console.log(`${newAccounts.count} new accounts`)

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
              tag: { NOT: { discordId: null } },
            },
          },
        },
      },
    },
  })

  const newTickets = await db.accountTerminal.createMany({
    skipDuplicates: true,
    data: accounts.map((a) => {
      return {
        accountId: a.id,
        terminalId: params.terminalId,
        active: false,
        ...(a.discordId && { joinedAt: new Date(accountDiscordId_metadata[a.discordId].joinedAt) }),
      }
    }),
  })

  console.log(`${newTickets.count} new tickets`)

  // step 3.
  // organize tag diff between db and discord per account
  type ATT = {
    tagId: number
    ticketAccountId: number
    ticketTerminalId: number
  }
  let addAccountTerminalTags: ATT[] = []
  let removeAccountTerminalTags: ATT[] = []

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
  const addTicketTags = await db.accountTerminalTag.createMany({
    skipDuplicates: true,
    data: addAccountTerminalTags,
  })

  console.log(`${addTicketTags.count} tag associations created`)

  // step 3b.
  // delete AccountTerminalTags for memberships that have tags in our db that they no longer own in Discord
  const removeTicketTags = await db.$transaction(
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

  console.log(`${removeTicketTags.length} tag associations removed`)

  // other option using native `deleteMany`
  // this takes less code, but for some reason feels weird when I imagine the generated SQL
  // const removeTicketTags = db.accountTerminalTag.deleteMany({
  //   where: {
  //     OR: removeAccountTerminalTags,
  //   },
  // })

  // step 3c.
  // await both queries because they can run in parallel
  // await addTicketTags
  // await removeTicketTags

  // returns the count (to know if we should refetch) and the last guildMember
  let count = guildMembers.length
  if (count === 1000) {
    let afterId = guildMembers[count - 1].user.id
    console.log("returning retry")
    res.status(200).json({ retry: true, afterId: afterId })
  } else {
    console.log("returning NO retry")
    res.status(200).json({ retry: false, afterId: null })
  }
}
