import { useMutation } from "@blitzjs/rpc"
import { BackspaceIcon, SaveIcon } from "@heroicons/react/outline"
import { FungibleTransferFields } from "app/check/components/FungibleTransferFields"
import { CheckType } from "app/check/types"
import SwitchField from "app/core/components/form/SwitchField"
import TextareaField from "app/core/components/form/TextareaField"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import convertDateFieldInputToDate from "app/core/utils/convertDateFieldInputToDate"
import formatDateForFieldInput from "app/core/utils/formatDateForFieldInput"
import { getNetworkTokens } from "app/core/utils/networkInfo"
import { useResolveEnsAddress } from "app/proposalForm/hooks/useResolveEnsAddress"
import { preparePaymentTransaction } from "app/transaction/payments"
import { Form } from "react-final-form"
import updateSchedule from "../mutations/updateSchedule"
import { Schedule, ScheduleEnds } from "../types"
import ScheduleFields from "./ScheduleFields"

export const UpdateScheduleForm = ({
  schedule,
  goBack,
  onSuccess,
  className = "",
}: {
  schedule: Schedule
  goBack: () => void
  onSuccess: () => void
  className?: string
}) => {
  const tokens = getNetworkTokens(schedule.chainId)
  const { resolveEnsAddress } = useResolveEnsAddress()

  const [updateScheduleMutation, { isLoading }] = useMutation(updateSchedule, {
    onSuccess: (schedule) => {
      console.log("schedule", schedule)
      onSuccess()
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  return (
    <div className={className}>
      <Form
        initialValues={{
          title: schedule.data.title,
          recipientAddress: schedule.data.meta.recipient,
          token: schedule.data.meta.token,
          tokenAmount: schedule.data.meta.amount?.toString(),
          scheduleStartDate: formatDateForFieldInput(new Date(schedule.data.startDate)),
          scheduleRepeatFrequency: schedule.data.repeatFrequency.toString(),
          scheduleRepeatPeriod: schedule.data.repeatPeriod,
          scheduleEnds: schedule.data.maxCount ? ScheduleEnds.AFTER_CYCLES : ScheduleEnds.NEVER,
          scheduleMaxCount: schedule.data.maxCount?.toString() || "1",
        }}
        onSubmit={async (values, form) => {
          const recipient = await resolveEnsAddress(values.recipientAddress?.trim())
          const { to, value, data } = preparePaymentTransaction(
            recipient!,
            values.token,
            values.tokenAmount
          )

          await updateScheduleMutation({
            scheduleId: schedule.id,
            title: values.title,
            to: to,
            value: value.toString(),
            data: data,
            meta: {
              type: CheckType.FungibleTransfer,
              recipient,
              token: values.token,
              amount: values.tokenAmount,
            },
            schedule: {
              startDate: convertDateFieldInputToDate(values.scheduleStartDate),
              repeatFrequency: parseInt(values.scheduleRepeatFrequency),
              repeatPeriod: values.scheduleRepeatPeriod,
              maxCount:
                values.scheduleEnds === ScheduleEnds.NEVER
                  ? undefined
                  : parseInt(values.scheduleMaxCount),
            },
          })
        }}
        render={({ form, handleSubmit }) => {
          const formState = form.getState()
          return (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-row space-x-4 items-center">
                <button
                  onClick={() => goBack()}
                  className="cursor-pointer text-marble-white disabled:cursor-not-allowed disabled:text-concrete w-fit flex flex-row space-x-2 items-center rounded-md bg-charcoal hover:bg-wet-concrete px-3 py-1"
                >
                  <BackspaceIcon className={`h-5 w-5 `} />
                  <p>Back</p>
                </button>
                <button
                  onClick={() => handleSubmit()}
                  disabled={formState.invalid}
                  className="cursor-pointer text-marble-white disabled:cursor-not-allowed disabled:text-concrete w-fit flex flex-row space-x-2 items-center rounded-md bg-charcoal hover:bg-wet-concrete pl-2 pr-3 py-1"
                >
                  <SaveIcon className={`h-5 w-5`} />
                  <p>Save</p>
                </button>
              </div>
              <TextareaField
                title="Note*"
                fieldName="title"
                placeholder="Enter a few words for accounting"
              />
              <FungibleTransferFields formState={formState} tokens={tokens} />
              <ScheduleFields formState={formState} minCycles={schedule.counter || 1} />
            </form>
          )
        }}
      />
    </div>
  )
}

export default UpdateScheduleForm
