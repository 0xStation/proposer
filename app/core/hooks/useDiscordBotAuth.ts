import { useEffect, useState } from "react"
import useLocalStorage from "./useLocalStorage"
import usePopupWindow from "./usePopupWindow"

type Auth = {
  connected: boolean
}

const useDiscordBotAuth = (guildId: string) => {
  const redirectUri =
    typeof window !== "undefined" &&
    `${window.location.href.split("/").slice(0, 3).join("/")}/auth/discord`
  const { onOpen, windowInstance } = usePopupWindow(
    `https://discord.com/api/oauth2/authorize?guild_id=${guildId}&client_id=963465926353752104&permissions=268435456&scope=bot&redirect_uri=${encodeURIComponent(
      redirectUri
    )}`
  )
  const [error, setError] = useState<any>(null)
  const [auth, setAuth] = useLocalStorage<Partial<Auth>>(`bot_${guildId}`, {})

  /** On a window creation, we set a new listener */
  useEffect(() => {
    if (!windowInstance) return
  }, [windowInstance, setAuth])

  return {
    connected: auth?.connected,
    error,
    onOpen: () => {
      setError(null)
      onOpen()
    },
    isAuthenticating: !!windowInstance && !windowInstance.closed,
  }
}

export default useDiscordBotAuth
