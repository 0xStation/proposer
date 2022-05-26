import { requireEnv } from "app/utils/requireEnv"

export default async function handler(req, res) {
  const params = new URLSearchParams()

  if (!requireEnv("DISCORD_CLIENT_ID") || !requireEnv("DISCORD_CLIENT_SECRET")) {
    res.status(400).json({ error: "invalid" })
    return
  }

  params.append("client_id", requireEnv("DISCORD_CLIENT_ID"))
  params.append("client_secret", requireEnv("DISCORD_CLIENT_SECRET"))
  params.append("redirect_uri", req.body.redirect)
  params.append("grant_type", "authorization_code")
  params.append("code", req.body.code)

  try {
    const response = await fetch(`${requireEnv("BLITZ_PUBLIC_API_ENDPOINT")}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: params,
    })

    const token = await response.json()
    res.status(200).json(token)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "something went wrong!" })
  }
}
