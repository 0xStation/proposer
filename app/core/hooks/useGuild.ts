import { useState, useEffect } from "react"

type Guild = {
  roles: Role[]
}

type Role = {
  name: string
  id: string
}

const useGuild = (guildId: string | undefined) => {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [guild, setGuild] = useState<Guild>()

  useEffect(() => {
    const fetchAsync = async () => {
      const response = await fetch("/api/discord/get-guild", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ guild_id: guildId }),
      })

      if (response.status !== 200) {
        setGuild(undefined)
        setStatus("error")
        return
      }
      const guild = await response.json()
      setGuild(guild)
      setStatus("ready")
    }
    if (guildId) {
      fetchAsync()
    }
  }, [guildId])

  console.log(guild)

  return { status, guild }
}

export default useGuild
