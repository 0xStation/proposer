export default async function handler(req, res) {
  const response = await fetch(`${process.env.API_ENDPOINT}/guilds/${req.body.guild_id}`, {
    method: "GET",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
  })

  const guild = await response.json()

  if (guild.code === 50001 || guild.code === 50035) {
    res.status(401).json({ error: "Guild not authenticated." })
    return
  }

  res.status(200).json(guild)
}
