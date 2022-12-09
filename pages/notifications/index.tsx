import { useEffect } from "react"
import { BlitzPage } from "@blitzjs/next"
import Image from "next/image"
import { useNotifications } from "app/core/hooks/useNotifications"
import { NovuProvider, useNotifications as useNovuNotifications } from "@novu/notification-center"
import StationLogo from "public/station-letters.svg"
import { convertJSDateToDateAndTime } from "app/core/utils/convertJSDateToDateAndTime"
import AccountMediaRow from "app/comment/components/AccountMediaRow"
import Layout from "app/core/layouts/Layout"

function CustomNotificationCenter() {
  const { notifications, fetchNextPage, hasNextPage, fetching, markAsSeen, refetch } =
    useNovuNotifications()

  useEffect(() => {
    refetch()
  }, [])

  console.log(notifications)

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
  const {
    sendNewCommentNotification,
    sendNewProposalNotification,
    sendPaymentNotification,
    sendNewRFPSubmissionNotification,
    sendProposalApprovalNotification,
  } = useNotifications()
  return (
    <>
      {/* <button
        onClick={async () => {
          await sendProposalApprovalNotification({
            recipient: "tester",
            payload: {
              from: { address: "0x6860C9323d4976615ae515Ab4b0039d7399E7CC8" },
              proposalTitle: "New proposal!",
            },
          })
        }}
        className="px-2 py-2 bg-neon-carrot text-tunnel-black"
      >
        TRIGGER NOTIFICATION
      </button> */}
      <NovuProvider subscriberId={"tester"} applicationIdentifier={"mbe4KpHO7Mj5"}>
        <CustomNotificationCenter />
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
