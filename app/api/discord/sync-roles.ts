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

  // get the current members from the guild
  // TODO: this is going to only accept the first 1000, honestly
  // we need more tech time to figure out how to fetch > 1000 nicely
  const response = await fetch(
    `${process.env.BLITZ_PUBLIC_API_ENDPOINT}/guilds/${terminal.data.guildId}/members?limit=1000`,
    {
      method: "GET",
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  )

  const guildMembers = await response.json()

  if (guildMembers.code) {
    // discord status codes
    // https://discord.com/developers/docs/topics/opcodes-and-status-codes
    res.status(401).json({ error: "Guild not authenticated." })
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

  // now that we have the list, we need to shape the guild member object a bit
  // activeGuildMembers just filtered by which members HAD an active tag
  // now we need to map to actually get the tags that overlapped
  const filteredActiveGuildMembers = activeGuildMembers.map((gm) => {
    const tagOverlap = activeCreatedTagDiscordIds.filter((tag) => gm.roles.includes(tag))

    const tagOverlapId = tagOverlap
      .map((discordId) => {
        const tag = activeTags.find((tag) => {
          return tag.discordId === discordId
        })

        return tag?.id
      })
      .filter((tag): tag is number => !!tag) // remove possible undefined from `find` in map above

    return {
      discordId: gm.user.id,
      name: gm.nick || gm.user.username,
      incomingTagIds: tagOverlapId,
      avatarHash: gm.user.avatar,
      joinedAt: gm.joined_at,
    }
  })

  filteredActiveGuildMembers.forEach(async (user) => {
    // creates an account for the active guild member if one does not exist
    // if one does exist, an empty update map will just skip over this and return the account
    const account = await db.account.upsert({
      where: { discordId: user.discordId },
      update: {
        data: {
          name: user.name,
          pfpURL: user.avatarHash
            ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatarHash}.png`
            : undefined,
        },
      },
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

    // In order to get the difference between an existing station members tags and their new tags, we need to fetch
    // their existing tags. This lives on their ticket to the given terminal. Note, this is not a concern for newly
    // created accounts, since there will be no "difference" of roles - the incoming ones are correct.
    const existingTicket = await db.accountTerminal.findUnique({
      where: {
        accountId_terminalId: {
          accountId: account.id,
          terminalId: params.terminalId,
        },
      },
      include: {
        tags: true,
      },
    })

    // building up the tag object
    // easier to do it this way since only existing tickets may have the "deleteMany" key.
    // not very "functional" but oh well...
    const tagObject = {}

    if (existingTicket) {
      const existingTags = existingTicket.tags
      const tagsToRemove = existingTags.filter((tag) => !user.incomingTagIds.includes(tag.tagId))
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
      connectOrCreate: user.incomingTagIds.map((tagId) => {
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

    const ticket = await db.accountTerminal.upsert({
      where: { accountId_terminalId: { accountId: account.id, terminalId: params.terminalId } },
      update: {
        ...(!account.address && { joinedAt: new Date(user.joinedAt) }), // only update joinedAt if still a discord-only imported account
        tags: tagObject,
      },
      create: {
        accountId: account.id,
        terminalId: params.terminalId,
        active: false,
        joinedAt: new Date(user.joinedAt),
        tags: {
          create: user.incomingTagIds.map((tag) => {
            return { tagId: tag }
          }),
        },
      },
    })
  })

  // better error handling and success messages prob but im exhausted rn
  res.status(200).json({ response: "success" })
}
