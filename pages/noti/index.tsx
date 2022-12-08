import { useEffect } from "react"
import { BlitzPage } from "@blitzjs/next"
import Image from "next/image"
import { useNotifications } from "app/core/hooks/useNotifications"
import { NovuProvider, useNotifications as useNovuNotifications } from "@novu/notification-center"
import StationLogo from "public/station-letters.svg"
import { convertJSDateToDateAndTime } from "app/core/utils/convertJSDateToDateAndTime"
import { notificationTemplateIdToContentMap } from "app/core/utils/constants"

function CustomNotificationCenter() {
  const { notifications, fetchNextPage, hasNextPage, fetching, markAsSeen, refetch } =
    useNovuNotifications()

  useEffect(() => {
    refetch()
  }, [])

  console.log(notifications)

  return (
    <div className="max-w-screen-xl mx-auto mt-20">
      {/* Table */}
      <table className="w-full table-auto">
        {/* Columns */}
        <thead>
          <tr className="border-b border-concrete">
            <th className="text-xs uppercase text-light-concrete pb-2 pl-4 text-left">User</th>
            <th className="text-xs uppercase text-light-concrete pb-2 text-left">Notification</th>
            <th className="text-xs uppercase text-light-concrete pb-2 text">Time</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((notification, idx) => {
            return (
              <tr
                className="border-b border-wet-concrete cursor-pointer hover:bg-wet-concrete"
                key={`row-${idx}`}
              >
                <td className="py-4 pl-4 align-top">
                  <Image src={StationLogo} alt="Station logo" height={16} width={50} />
                </td>
                <td className="py-4 space-y-2">
                  <span className="block">{notification.payload.title}</span>
                  <span className="block text-marble-white text-opacity-80 text-sm">
                    {notification.payload.note}
                  </span>
                  <span className="block text-marble-white">{notification.payload.extra}</span>
                </td>
                <td className="py-4 align-top text-right pr-4">
                  <span className="text-sm">
                    {convertJSDateToDateAndTime({ timestamp: new Date(notification.createdAt) })}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
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
            payload: {
              from: "STATION",
              proposalTitle: "Proposal title",
              commentBody: "this is the comment_body",
            },
          })
        }}
        className="px-2 py-2 bg-neon-carrot text-tunnel-black"
      >
        TRIGGER NOTIFICATION
      </button>
      <NovuProvider subscriberId={"123abcdefg"} applicationIdentifier={"mbe4KpHO7Mj5"}>
        <CustomNotificationCenter />
      </NovuProvider>
    </>
  )
}

Demo.suppressFirstRenderFlicker = true

export default Demo
