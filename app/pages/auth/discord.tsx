import { useEffect } from "react"
import { useRouter } from "blitz"

const DiscordAuth = () => {
  const router = useRouter()

  useEffect(() => {
    if (router.query.code && router.query.state) {
      const state = router.query.state as string
      const { url } = JSON.parse(state)
      const target = `${window.location.origin}${url}`
      const redirect = `${window.location.origin}/auth/discord`

      fetch("/api/discord/exchange-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: router.query.code, redirect }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("data", data)
          if (data.error) {
            console.error(`${data.error}: ${data.error_description}`)
          } else {
            window.opener.postMessage(
              {
                type: "DISCORD_AUTH_SUCCESS",
                data: { access_token: data.access_token },
              },
              target
            )
          }
        })
        .catch((err) => {
          console.error("Error authorizing discord", err)
          window.opener.postMessage(
            {
              type: "DISCORD_AUTH_ERROR",
              data: { error: err },
            },
            target
          )
        })
    }
  }, [router.query.code, router.query.state])

  return <div>authorizing... closing window soon</div>
}

export default DiscordAuth
