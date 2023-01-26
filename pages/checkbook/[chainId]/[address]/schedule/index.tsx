import { gSSP } from "app/blitz-server"
import Link from "next/link"
import { invoke, useQuery } from "@blitzjs/rpc"
import { BlitzPage, useParam, Routes } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import Button from "app/core/components/sds/buttons/Button"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { formatDate } from "app/core/utils/formatDate"
import { isAddress } from "ethers/lib/utils"
import { useRouter } from "next/router"
import getCheckbook from "app/checkbook/queries/getCheckbook"
import { useChecks } from "app/check/hooks/useChecks"
import CheckbookSidebar from "app/checkbook/components/CheckbookSidebar"
import { useState } from "react"
import NewCheckModal from "app/check/components/NewCheckModal"
import ViewCheckModal from "app/check/components/ViewCheckModal"
import { Check } from "app/check/types"
import { CheckStatusIndicator } from "app/check/components/CheckStatusIndicator"
import { useSafeMetadata } from "app/safe/hooks/useSafeMetadata"
import getChecks from "app/check/queries/getChecks"
import { useInboxes } from "app/inbox/hooks/useInboxes"
import NewInboxModal from "app/inbox/components/NewInboxModal"
import { useCheckbook } from "app/checkbook/hooks/useCheckbook"
import { useSchedules } from "app/schedule/hooks/useSchedules"
import truncateString from "app/core/utils/truncateString"
import ViewScheduleModal from "app/schedule/componenets/ViewScheduleModal"
import { Schedule } from "app/schedule/types"

const SchedulesHome: BlitzPage = () => {
  const checkbookChainId = useParam("chainId", "number") as number
  const checkbookAddress = useParam("address", "string") as string
  const [newCheckModalOpen, setNewCheckModalOpen] = useState<boolean>(false)
  const [viewScheduleModalOpen, setViewScheduleModalOpen] = useState<boolean>(false)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule>()
  const [newInboxModalOpen, setNewInboxModalOpen] = useState<boolean>(false)

  const router = useRouter()

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
                    {schedule.data.repeatFrequency + " " + schedule.data.repeatPeriod}
                  </td>
                  <td className="text-base py-4">
                    {schedule.data.maxCount
                      ? `${schedule.counter}/${schedule.data.maxCount} cycles`
                      : "Ongoing"}
                  </td>
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
