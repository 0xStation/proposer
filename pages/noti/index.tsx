import { useEffect } from "react"
import { BlitzPage } from "@blitzjs/next"
import { useNotifications } from "app/core/hooks/useNotifications"
import { NovuProvider, useNotifications as useNovuNotifications } from "@novu/notification-center"

function CustomNotificationCenter() {
  const { notifications, fetchNextPage, hasNextPage, fetching, markAsSeen, refetch } =
    useNovuNotifications()

  useEffect(() => {
    refetch()
  }, [])

  console.log(notifications)
  console.log(fetching)

  return (
    <>
      {/* Table */}
      <table className="w-full table-auto">
        {/* Columns */}
        <thead>
          <tr className="border-b border-concrete">
            <th className="text-xs uppercase text-light-concrete pb-2 pl-4 text-left">User</th>
            <th className="text-xs uppercase text-light-concrete pb-2 text-left">Notification</th>
            <th className="text-xs uppercase text-light-concrete pb-2 text-left">Time</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((notification, idx) => {
            return (
              <tr
                className="border-b border-wet-concrete cursor-pointer hover:bg-wet-concrete"
                key={`row-${idx}`}
              >
                <td>{notification.content}</td>
                <td>{notification.content}</td>
                <td>{notification.createdAt}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

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
      <NovuProvider subscriberId={"123abc"} applicationIdentifier={"mbe4KpHO7Mj5"}>
        <CustomNotificationCenter />
      </NovuProvider>
    </>
  )
}

Demo.suppressFirstRenderFlicker = true

export default Demo
