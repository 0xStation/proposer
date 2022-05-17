import { useEffect } from "react"
import { useRouter } from "blitz"

const DiscordAuth = () => {
  const router = useRouter()

  useEffect(() => {
    if (router.query.code && router.query.state) {
      const state = router.query.state as string
      const { url } = JSON.parse(state)
      const target = `${window.location.origin}${url}`

      fetch("/api/discord/exchange-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: router.query.code }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            console.error(`${data.error}: ${data.error_description}`)
          } else {
            window.opener.postMessage(
              {
                type: "DC_AUTH_SUCCESS",
                data: { access_token: data.access_token },
              },
              target
            )
          }
        })
    }
  }, [router.query.code, router.query.state])

  return <div>authorizing... closing window soon</div>
}

export default DiscordAuth
