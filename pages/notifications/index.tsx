import { useEffect } from "react"
import { BlitzPage } from "@blitzjs/next"
import Image from "next/image"
import useStore from "app/core/hooks/useStore"
import { useNotifications } from "app/core/hooks/useNotifications"
import { NovuProvider, useNotifications as useNovuNotifications } from "@novu/notification-center"
import StationLogo from "public/station-letters.svg"
import { convertJSDateToDateAndTime } from "app/core/utils/convertJSDateToDateAndTime"
import AccountMediaRow from "app/comment/components/AccountMediaRow"
import Layout from "app/core/layouts/Layout"

function CustomNotificationCenter({ markAsRead }) {
  const { notifications, fetchNextPage, hasNextPage, fetching, refetch } = useNovuNotifications()

  useEffect(() => {
    refetch()
  }, [])

  return (
    <div className="mt-20">
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
            const from = notification.payload.from as { address: string } | "STATION"
            return (
              <tr
                className="border-b border-wet-concrete cursor-pointer hover:bg-wet-concrete"
                key={`row-${idx}`}
                onClick={() => {
                  markAsRead(notification._id)
                }}
              >
                <td className="py-4 pl-4 align-top">
                  <div className="flex flex-row items-center">
                    {!notification.seen && (
                      <span className="bg-neon-carrot h-2 w-2 rounded-full block mr-2"></span>
                    )}
                    {notification.payload.from === "STATION" ? (
                      <Image
                        src={StationLogo}
                        alt="Station logo"
                        height={16}
                        width={50}
                        className="block"
                      />
                    ) : (
                      <AccountMediaRow address={from != "STATION" ? from.address : ""} />
                    )}
                  </div>
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

const NotificationPage: BlitzPage = () => {
  const { markAsRead } = useNotifications()

  const activeUser = useStore((state) => state.activeUser)
  return (
    <>
      <NovuProvider subscriberId={activeUser?.address} applicationIdentifier={"mbe4KpHO7Mj5"}>
        <CustomNotificationCenter
          markAsRead={(notificationId) => markAsRead(activeUser?.address, notificationId)}
        />
      </NovuProvider>
    </>
  )
}

NotificationPage.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return <Layout title="View Notifications">{page}</Layout>
}

NotificationPage.suppressFirstRenderFlicker = true

export default NotificationPage
