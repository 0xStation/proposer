import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export const useIsRouterLoading = () => {
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleStart = (url) => {
      url !== router.asPath && setLoading(true)
    }
    const handleComplete = (url) => {
      // timeout is used to prevent glitching from loading to page
      setTimeout(() => setLoading(false), 500)
    }

    router.events.on("routeChangeStart", handleStart)
    router.events.on("routeChangeComplete", handleComplete)
    router.events.on("routeChangeError", handleComplete)

    return () => {
      router.events.off("routeChangeStart", handleStart)
      router.events.off("routeChangeComplete", handleComplete)
      router.events.off("routeChangeError", handleComplete)
    }
  })

  return [loading]
}
