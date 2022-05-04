export default async function handler(req, res) {
  const response = await fetch(`${process.env.API_ENDPOINT}/guilds/${req.body.guild_id}`, {
    method: "GET",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
  })

  const guild = await response.json()

  console.log(guild.code)

  if (!guild.code) {
    res.status(200).json(guild)
  }

  // discord status codes
  // https://discord.com/developers/docs/topics/opcodes-and-status-codes
  // could maybe respond better depending on the code
  // for now, the presense of the code implies something went wrong...
  res.status(401).json({ error: "Guild not authenticated." })
}
