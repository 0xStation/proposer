export default async function handler(req, res) {
  const params = new URLSearchParams()

  if (
    !process.env.DISCORD_CLIENT_ID ||
    !process.env.DISCORD_CLIENT_SECRET ||
    !process.env.REDIRECT_URL
  ) {
    res.status(400).json({ error: "invalid" })
    return
  }

  params.append("client_id", process.env.DISCORD_CLIENT_ID)
  params.append("client_secret", process.env.DISCORD_CLIENT_SECRET)
  params.append("grant_type", "authorization_code")
  // code can only be used once
  params.append("code", req.query.code.toString())
  params.append("redirect_uri", process.env.REDIRECT_URL)

  try {
    const response = await fetch(`${process.env.API_ENDPOINT}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    })

    const token = await response.json()
    res.status(200).json(token)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "something went wrong!" })
  }
}
