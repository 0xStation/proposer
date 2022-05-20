import db from "db"
import { Terminal } from "app/terminal/types"

export default async function handler(req, res) {
  const params = JSON.parse(req.body)
  const terminal = (await db.terminal.findUnique({
    where: { id: params.terminalId },
    include: { tags: true },
  })) as unknown as Terminal

  if (!terminal) {
    res.status(401).json({ error: "Terminal not found" })
    return
  }

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

  const activeTags = terminal.tags.filter((tag) => tag.active)
  const activeCreatedTagDiscordIds = activeTags.map((tag) => tag.discordId || "")
  const activeGuildMembers = guildMembers.filter((gm) => {
    return gm.roles.some((r) => activeCreatedTagDiscordIds.includes(r))
  })

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
    }
  })

  filteredActiveGuildMembers.forEach(async (user) => {
    const account = await db.account.upsert({
      where: { discordId: user.discordId },
      update: {},
      create: {
        discordId: user.discordId,
        data: {
          name: user.name,
          pfpUrl: user.avatarHash
            ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatarHash}.png`
            : undefined,
        },
      },
    })

    // case where you remove a tag from an existing member
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

    // new members will not yet have a ticket, don't have to worry about this
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
        tags: tagObject,
      },
      create: {
        accountId: account.id,
        terminalId: params.terminalId,
        active: false,
        tags: {
          create: user.incomingTagIds.map((tag) => {
            return { tagId: tag }
          }),
        },
      },
    })
  })

  res.status(200).json({ response: "success" })
}
