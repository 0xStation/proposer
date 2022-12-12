// packages
import Link from "next/link"
import Image from "next/image"
import { useEffect } from "react"
import { BlitzPage } from "@blitzjs/next"
import { NovuProvider, useNotifications as useNovuNotifications } from "@novu/notification-center"
// hooks
import useStore from "app/core/hooks/useStore"
import { useNotifications } from "app/core/hooks/useNotifications"
// components
import Layout from "app/core/layouts/Layout"
import AccountMediaRow from "app/comment/components/AccountMediaRow"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
// utils
import { convertJSDateToDateAndTime } from "app/core/utils/convertJSDateToDateAndTime"
// assets
import StationLogo from "public/station-letters.svg"

function CustomNotificationCenter({ markAsRead }) {
  // not actually sure what the page limit is
  const { notifications, fetchNextPage, hasNextPage, fetching, refetch } = useNovuNotifications()

  useEffect(() => {
    refetch()
  }, [])

  return (
    <div className="h-full md:h-[calc(100vh-240px)] p-10 flex-1">
      <h1 className="font-bold text-2xl mb-12">Notifications</h1>

      {/* Table */}
      <table className="w-full table-auto pb-12">
        {/* Columns */}
        <thead>
          <tr className="border-b border-concrete">
            <th className="text-xs uppercase text-light-concrete pb-2 pl-4 text-left">User</th>
            <th className="text-xs uppercase text-light-concrete pb-2 text-left">Notification</th>
            {/* empty heading for view button */}
            <th></th>
            <th className="text-xs uppercase text-light-concrete pb-2 text">Time</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((notification, idx) => {
            const from = notification.payload.from as { address: string } | "STATION"
            return (
              <tr
                className="last-of-type:border-b-0 border-b border-wet-concrete cursor-pointer hover:bg-wet-concrete"
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
                <td className="py-4 space-y-2 w-[40%]">
                  <span className="block">{notification.payload.title}</span>
                  <span className="block text-marble-white text-opacity-80 text-sm">
                    {notification.payload.note}
                  </span>
                  <span className="block text-marble-white">{notification.payload.extra}</span>
                </td>
                <td>
                  {notification.payload.link && (
                    <Link href={notification.payload.link}>
                      <Button type={ButtonType.Secondary} onClick={() => {}}>
                        View
                      </Button>
                    </Link>
                  )}
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
