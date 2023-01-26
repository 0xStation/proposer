import Modal from "app/core/components/Modal"
import { CheckDetails } from "app/check/components/CheckDetails"
import useStore from "app/core/hooks/useStore"
import MetadataItem from "app/core/components/MetadataItem"
import { Schedule } from "../types"
import { Check } from "app/check/types"
import { formatDate } from "app/core/utils/formatDate"
import { useIsUserSigner } from "app/safe/hooks/useIsUserSigner"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { PencilIcon } from "@heroicons/react/solid"
import { StopIcon } from "@heroicons/react/outline"
import { Stop } from "@mui/icons-material"
import { useState } from "react"
import UpdateScheduleForm from "./UpdateScheduleForm"
import { invalidateQuery } from "@blitzjs/rpc"
import getChecks from "app/check/queries/getChecks"
import getSchedules from "../queries/getSchedules"
import { useToast } from "app/core/hooks/useToast"

export const ViewScheduleModal = ({
  schedule,
  isOpen,
  setIsOpen,
}: {
  schedule: Schedule
  isOpen: boolean
  setIsOpen: (open) => void
}) => {
  const activeUser = useStore((state) => state.activeUser)
  const userIsSigner = useIsUserSigner({
    chainId: schedule.chainId,
    safeAddress: schedule.address,
    userAddress: activeUser?.address,
  })
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const { successToast, errorToast } = useToast()

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      {isEdit ? (
        <UpdateScheduleForm
          schedule={schedule}
          goBack={() => {
            setIsEdit(false)
          }}
          onSuccess={() => {
            setIsOpen(false)
            setIsEdit(false)
            successToast("Schedule updated")
            invalidateQuery(getChecks)
            invalidateQuery(getSchedules)
          }}
          className="p-6 mt-4"
        />
      ) : (
        <div className="p-6 mt-4 space-y-6">
          {userIsSigner && (
            <button
              disabled={!userIsSigner}
              onClick={() => setIsEdit(true)}
              className="cursor-pointer text-marble-white disabled:cursor-not-allowed disabled:text-concrete w-fit flex flex-row space-x-2 items-center rounded-md bg-charcoal hover:bg-wet-concrete px-3 py-1"
            >
              <PencilIcon className={`h-5 w-5 `} />
              <p>Edit</p>
            </button>
          )}
          <CheckDetails check={schedule as unknown as Check} />
          <MetadataItem label="Start date">
            {formatDate(new Date(schedule.data.startDate))}
          </MetadataItem>
          <MetadataItem label="Repeat every">
            {schedule.data.repeatFrequency + " " + schedule.data.repeatPeriod}
          </MetadataItem>
          <MetadataItem label="Progress">
            {schedule.data.maxCount
              ? `${schedule.counter}/${schedule.data.maxCount} cycles`
              : "Ongoing"}
          </MetadataItem>
        </div>
      )}
    </Modal>
  )
}

export default ViewScheduleModal
