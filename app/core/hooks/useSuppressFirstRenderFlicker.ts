import { useLayoutEffect, useState } from "react"

export const useSuppressFirstRenderFlicker = () => {
  const [isRendered, setRendered] = useState(false)
  useLayoutEffect(() => {
    const timerId = setTimeout(() => {
      setRendered(true)
    }, 200)
    return () => clearTimeout(timerId)
  }, [])
  return !isRendered
}
