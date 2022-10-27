import { useEffect, useState } from "react"
import useDiscordAuth from "./useDiscordAuth"

const useDiscordAuthWithCallback = (scope: string, callback: (authorization?: string) => void) => {
  const { authorization, onOpen, ...rest } = useDiscordAuth(scope)
  const [hasClickedAuth, setHasClickedAuth] = useState(false)

  const handleClick = () => {
    if (authorization) callback(authorization)
    else {
      onOpen()
      setHasClickedAuth(true)
    }
  }

  useEffect(() => {
    if (!authorization || !hasClickedAuth) return

    callback(authorization)
    setHasClickedAuth(false)
  }, [authorization, hasClickedAuth, callback])

  return {
    callbackWithDCAuth: handleClick,
    authorization,
    ...rest,
  }
}

export default useDiscordAuthWithCallback
