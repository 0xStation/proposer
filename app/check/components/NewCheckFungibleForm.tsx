import { Form } from "react-final-form"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { useParam } from "@blitzjs/next"
import { getNetworkTokens } from "app/core/utils/networkInfo"
import { useMutation } from "@blitzjs/rpc"
import createCheck from "../mutations/createCheck"
import { preparePaymentTransaction } from "app/transaction/payments"
import { CheckType } from "../types"
import { useResolveEnsAddress } from "app/proposalForm/hooks/useResolveEnsAddress"
import SwitchField from "app/core/components/form/SwitchField"
import { ScheduleEnds, ScheduleRepeatPeriod } from "app/schedule/types"
import formatDateForFieldInput from "app/core/utils/formatDateForFieldInput"
import convertDateFieldInputToDate from "app/core/utils/convertDateFieldInputToDate"
import ScheduleFields from "app/schedule/componenets/ScheduleFields"
import TextareaField from "app/core/components/form/TextareaField"
import { FungibleTransferFields } from "./FungibleTransferFields"

export const NewCheckFungibleForm = ({ goBack, onCreate }) => {
  const checkbookChainId = useParam("chainId", "number") as number
  const checkbookAddress = useParam("address", "string") as string
  const tokens = getNetworkTokens(checkbookChainId)
  const { resolveEnsAddress } = useResolveEnsAddress()

  const [createCheckMutation, { isLoading }] = useMutation(createCheck, {
    onSuccess: (check) => {
      console.log("check", check)
      onCreate()
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  return (
    <>
      <h1 className="text-2xl font-bold">Transfer fungible tokens (ETH or ERC20)</h1>
      <Form
        initialValues={{
          scheduleStartDate: formatDateForFieldInput(new Date()),
          scheduleRepeatFrequency: "1",
          scheduleRepeatPeriod: ScheduleRepeatPeriod.WEEKS,
          scheduleEnds: ScheduleEnds.NEVER,
          scheduleMaxCount: "1",
        }}
        onSubmit={async (values, form) => {
          const recipient = await resolveEnsAddress(values.recipientAddress?.trim())
          const { to, value, data } = preparePaymentTransaction(
            recipient!,
            values.token,
            values.tokenAmount
          )

          await createCheckMutation({
            chainId: checkbookChainId,
            address: checkbookAddress,
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
            ...(values.scheduleEnabled && {
              schedule: {
                startDate: convertDateFieldInputToDate(values.scheduleStartDate),
                repeatFrequency: parseInt(values.scheduleRepeatFrequency),
                repeatPeriod: values.scheduleRepeatPeriod,
                maxCount:
                  values.scheduleEnds === ScheduleEnds.NEVER
                    ? undefined
                    : parseInt(values.scheduleMaxCount),
              },
            }),
          })
        }}
        render={({ form, handleSubmit }) => {
          const formState = form.getState()
          return (
            <form onSubmit={handleSubmit}>
              <TextareaField
                title="Note*"
                fieldName="title"
                placeholder="Enter a few words for accounting"
              />
              <FungibleTransferFields formState={formState} tokens={tokens} />
              <SwitchField title="Add a repeating schedule?" fieldName="scheduleEnabled" />
              {formState.values.scheduleEnabled && <ScheduleFields formState={formState} />}
              {/* BUTTONS */}
              <div className="mt-12 flex justify-between">
                <Button type={ButtonType.Unemphasized} onClick={goBack}>
                  Back
                </Button>
                <Button isSubmitType={true} isLoading={isLoading} isDisabled={formState.invalid}>
                  Next
                </Button>
              </div>
            </form>
          )
        }}
      />
    </>
  )
}
