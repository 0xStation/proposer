import { useState, useEffect } from "react"
import { getAntiCSRFToken } from "@blitzjs/auth"

interface GuildMember {
  nick?: string
  roles: string[]
  user: {
    id: string
    username: string
    avatar: string
  }
  joined_at: string
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
          "anti-csrf": getAntiCSRFToken(),
        },
        body: JSON.stringify({ guildId }),
      })

      if (response.status !== 200) {
        const error = await response.json()
        console.error(error)
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
