import { BlitzPage, useParam } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import { formatDate } from "app/core/utils/formatDate"
import CheckbookSidebar from "app/checkbook/components/CheckbookSidebar"
import { useState } from "react"
import { useSchedules } from "app/schedule/hooks/useSchedules"
import truncateString from "app/core/utils/truncateString"
import ViewScheduleModal from "app/schedule/componenets/ViewScheduleModal"
import { Schedule } from "app/schedule/types"

const SchedulesHome: BlitzPage = () => {
  const checkbookChainId = useParam("chainId", "number") as number
  const checkbookAddress = useParam("address", "string") as string
  const [viewScheduleModalOpen, setViewScheduleModalOpen] = useState<boolean>(false)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule>()

  const { schedules } = useSchedules(checkbookChainId, checkbookAddress)

  return (
    <>
      {selectedSchedule && (
        <ViewScheduleModal
          schedule={selectedSchedule}
          isOpen={viewScheduleModalOpen}
          setIsOpen={setViewScheduleModalOpen}
        />
      )}
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-bold">Schedules</h1>
      </div>
      {/* PROPOSALS TABLE */}
      <table className="mt-8 min-w-[600px] md:w-full">
        {/* TABLE HEADERS */}
        <thead className="overflow-x-auto min-w-[600px]">
          <tr className="border-t border-b border-wet-concrete">
            <th className="pl-4 text-xs tracking-wide uppercase text-concrete py-2 text-left">
              Execution
            </th>
            <th className="text-xs tracking-wide uppercase text-concrete py-2 text-left">
              Start Date
            </th>
            <th className="text-xs tracking-wide uppercase text-concrete py-2 text-left">
              Repeat every
            </th>
            <th className="text-xs tracking-wide uppercase text-concrete py-2 text-left">
              Progress
            </th>
            <th className="text-xs tracking-wide uppercase text-concrete py-2 text-left">
              Next refresh at
            </th>
          </tr>
        </thead>
        {/* TABLE BODY */}
        <tbody>
          {schedules &&
            schedules.length > 0 &&
            schedules.map((schedule, idx) => {
              return (
                <tr
                  key={idx}
                  className="h-18 border-b border-charcoal cursor-pointer hover:bg-charcoal"
                  onClick={() => {
                    setSelectedSchedule(schedule)
                    setViewScheduleModalOpen(true)
                  }}
                >
                  <td className="pl-4 text-base py-4">
                    {`Transfer ${schedule.data.meta.amount} ${
                      schedule.data.meta.token?.symbol
                    } to ${truncateString(schedule.data.meta.recipient)}`}
                  </td>
                  <td className="text-base py-4">
                    {formatDate(new Date(schedule.data.startDate))}
                  </td>
                  <td className="text-base py-4">
                    {schedule.data.periodCoefficient + " " + schedule.data.periodUnit}
                  </td>
                  <td className="text-base py-4">
                    {schedule.data.maxCount
                      ? `${schedule.counter}/${schedule.data.maxCount} cycles`
                      : "Ongoing"}
                  </td>
                  <td className="text-base py-4">{schedule.nextRefreshAt?.toUTCString()}</td>
                </tr>
              )
            })}
        </tbody>
      </table>
      {!schedules &&
        Array.from(Array(10)).map((idx) => (
          <div
            key={idx}
            tabIndex={0}
            className={`flex flex-row w-full my-1 rounded-lg bg-wet-concrete shadow border-solid h-[48px] motion-safe:animate-pulse`}
          />
        ))}
    </>
  )
}

SchedulesHome.suppressFirstRenderFlicker = true
SchedulesHome.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return (
    <Layout title="Checkbook">
      <div className="flex flex-col md:flex-row h-full">
        <CheckbookSidebar />
        <div className="p-5 md:p-10 w-full max-h-screen overflow-y-auto">{page}</div>
      </div>
    </Layout>
  )
}
export default SchedulesHome
