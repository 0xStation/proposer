import { useState, useEffect } from "react"
import useLocalStorage from "./useLocalStorage"

type Auth = {
  access_token: string
  tokenType: string
  expires: number
  authorization: string
}

// used to fetch the guilds of the active user
const useActiveUserGuilds = () => {
  const [authorization] = useLocalStorage<Partial<Auth>>("dc_auth_guilds", {}, false)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [guilds, setGuilds] = useState<{ img: string; label: string; value: string }[]>([])

  useEffect(() => {
    const fetchGuilds = async (token) => {
      if (token) {
        let response = await fetch(`https://discord.com/api/v8/users/@me/guilds`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.status !== 200) {
          setGuilds([])
          setStatus("error")
          return
        }

        let guilds = await response.json()
        if (Array.isArray(guilds)) {
          guilds = guilds
            .filter(({ owner, permissions }) => owner || (permissions & (1 << 3)) === 1 << 3)
            .map(({ id, icon, name }) => ({
              img: icon
                ? `https://cdn.discordapp.com/icons/${id}/${icon}.png`
                : "./default_discord_icon.png",
              label: name,
              value: id,
            }))
          setGuilds(guilds)
          setStatus("ready")
        }
      }
    }
    fetchGuilds(authorization.access_token)
  }, [authorization.access_token])

  return { status, guilds }
}

export default useActiveUserGuilds
