import { BlitzPage } from "@blitzjs/next"
import { useNotifications } from "app/core/hooks/useNotifications"

const Demo: BlitzPage = () => {
  const { sendNewCommentNotification } = useNotifications()
  return (
    <>
      <div>hello -- notifications demo</div>
      <button
        onClick={async () => {
          await sendNewCommentNotification({
            recipient: "123abcdefg",
            payload: { comment_body: "testing" },
          })
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
