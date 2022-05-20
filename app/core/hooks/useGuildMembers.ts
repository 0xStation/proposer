import { useState, useEffect } from "react"

interface GuildMember {
  nick?: string
  roles: string[]
  user: {
    id: string
    username: string
    avatar: string
  }
}

const useGuildMembers = (
  guildId: string | undefined
): { status: "loading" | "ready" | "error"; guildMembers: GuildMember[] } => {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [guildMembers, setGuildMembers] = useState<GuildMember[]>([])

  useEffect(() => {
    const fetchAsync = async () => {
      const response = await fetch("/api/discord/get-guild-members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ guild_id: guildId, limit: 1000 }),
      })

      if (response.status !== 200) {
        console.error(response)
        setStatus("error")
        return
      }
      const res = await response.json()
      const guildMembers = res.guildMembers as GuildMember[]
      setGuildMembers(guildMembers)
      setStatus("ready")
    }
    if (guildId) {
      fetchAsync()
    }
  }, [guildId])

  return { status, guildMembers }
}

export default useGuildMembers
