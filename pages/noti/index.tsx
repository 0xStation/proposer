import { BlitzPage } from "@blitzjs/next"

const Demo: BlitzPage = () => {
  const sendNotification = async () => {
    await fetch("https://api.novu.co/v1/events/trigger", {
      method: "POST",
      headers: {
        Authorization: `ApiKey ${process.env.NEXT_PUBLIC_NOVU_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "new-proposal",
        to: {
          subscriberId: "123",
        },
        payload: {},
      }),
    })
  }

  return (
    <>
      <div>hello -- notifications demo</div>
      <button
        onClick={async () => {
          await sendNotification()
        }}
        className="px-2 py-2 bg-neon-carrot text-tunnel-black"
      >
        TRIGGER NOTIFICATION
      </button>
    </>
  )
}

Demo.suppressFirstRenderFlicker = true

export default Demo
