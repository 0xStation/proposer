export default async function handler(req, res) {
  // const response = await fetch(`${process.env.BLITZ_PUBLIC_API_ENDPOINT}/users/@me/channels`, {
  //   method: "POST",
  //   headers: {
  //     Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     recipient_id: "401560556286509058",
  //   }),
  // })

  const response = await fetch(
    `${process.env.BLITZ_PUBLIC_API_ENDPOINT}/channels/977778504877867018/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: "test post, please ignore",
      }),
    }
  )

  const guild = await response.json()
  console.log(guild)

  if (!guild.code) {
    res.status(200).json(guild)
    return
  }

  // discord status codes
  // https://discord.com/developers/docs/topics/opcodes-and-status-codes
  // could maybe respond better depending on the code
  // for now, the presense of the code implies something went wrong...
  res.status(401).json({ error: "Guild not authenticated." })
}
