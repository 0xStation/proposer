import { useState, useEffect } from "react"

const useGuildMembers = (guildId: string) => {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [guildMembers, setGuildMembers] = useState()

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
      const guildMembers = await response.json()
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
