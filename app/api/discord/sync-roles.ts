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

  // Find the terminal we are interested in syncing
  const terminal = (await db.terminal.findUnique({
    where: { id: params.terminalId },
    include: { tags: true },
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

  let guildMembers
  try {
    guildMembers = await fetchGuildMembers(params.afterId)
  } catch (err) {
    console.error(err)
    res.status(401).json({ error: err })
    return
  }

  // active tags are the tags in the terminal that are "active" and should be considered for use
  const activeTags = terminal.tags.filter((tag) => tag.active)
  // filter to get the discordIds, which we need to compare to the tags from the discord guild member response
  const activeCreatedTagDiscordIds = activeTags.map((tag) => tag.discordId || "")
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
        const tag = activeTags.find((tag) => {
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
  const accounts = await db.$transaction(
    activeGuildMembers.map((guildMember) =>
      db.account.upsert({
        where: { discordId: guildMember.user.id },
        update: {},
        create: {
          discordId: guildMember.user.id,
          data: {
            name: guildMember.nick || guildMember.user.username,
            pfpURL: guildMember.user.avatar
              ? `https://cdn.discordapp.com/avatars/${guildMember.user.id}/${guildMember.user.avatar}.png`
              : undefined,
          },
        },
        include: {
          tickets: {
            include: {
              tags: true,
            },
          },
        },
      })
    )
  )

  // step 2. prepare the ticket data structure
  // for tickets that exist, we need to compare existing tags to incoming tags to remove tags that may currently
  // exist but are no longer active according to the new incoming tag list.
  // for new tickets, we just need to add incoming tags... there is nothing to compare so everything is fresh
  // ---
  // this map builds up a list of account object with a new field called tagObject which is the tags to update or remove
  // in the next step, we will create a transaction creating tickets using this tag data.
  const accountsWithTagObject = accounts.map((account) => {
    let existingTicket = account.tickets.find((ticket) => ticket.terminalId === params.terminalId)
    const tagObject = {}
    if (existingTicket) {
      const existingTags = existingTicket.tags
      const tagsToRemove = existingTags.filter(
        (tag) => !accountDiscordId_metadata[account.discordId].incomingTagIds.includes(tag.tagId)
      )
      const remove = {
        deleteMany: tagsToRemove.map((tag) => {
          return {
            tagId: tag.tagId,
          }
        }),
      }
      Object.assign(tagObject, remove)
    }
    const connectOrCreate = {
      connectOrCreate: accountDiscordId_metadata[account.discordId].incomingTagIds.map((tagId) => {
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
    }
    Object.assign(tagObject, connectOrCreate)

    return {
      ...account,
      tagObject,
    }
  })

  // step 3. Create the tickets
  // creates a new account terminal (ticket) relationship
  // The existing (update) case uses the tagObject from the previous step
  // the new (create) case loops over the incoming tags and creates a tag relationship for each.
  const tickets = await db.$transaction(
    accountsWithTagObject.map((account) =>
      db.accountTerminal.upsert({
        where: { accountId_terminalId: { accountId: account.id, terminalId: params.terminalId } },
        update: {
          ...(!account.address && {
            joinedAt: new Date(accountDiscordId_metadata[account.discordId].joinedAt),
          }), // only update joinedAt if still a discord-only imported account
          // now that I'm looking at it, we only use the tagObject for the update case
          // it's possible that in the map above, we can ignore the case in which ticket does not exist
          tags: account.tagObject,
        },
        create: {
          accountId: account.id,
          terminalId: params.terminalId,
          active: false,
          joinedAt: new Date(accountDiscordId_metadata[account.discordId].joinedAt),
          tags: {
            create: accountDiscordId_metadata[account.discordId].incomingTagIds.map((tag) => {
              return { tagId: tag }
            }),
          },
        },
      })
    )
  )

  // returns the count (to know if we should refetch) and the last guildMember
  let count = guildMembers.length
  if (count === 1000) {
    let afterId = guildMembers[count - 1].user.id
    res.status(200).json({ retry: true, afterId: afterId })
  } else {
    res.status(200).json({ retry: false, afterId: null })
  }
}
