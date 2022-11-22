import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useStore from "app/core/hooks/useStore"
import formatDateForFieldInput from "app/core/utils/formatDateForFieldInput"
import { Form } from "react-final-form"
import updateRfpStatus from "../mutations/updateRfpStatus"
import getRfpById from "../queries/getRfpById"
import { Rfp } from "../types"
import RfpStatusFields, { extractStatusValues } from "./fields/RfpStatusFields"

export const RfpStatusForm = ({ rfp }: { rfp?: Rfp | null }) => {
  const setToastState = useStore((state) => state.setToastState)

  const [updateRfpStatusMutation] = useMutation(updateRfpStatus, {
    onSuccess: (data) => {
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Successfully updated status and schedule.",
      })
      invalidateQuery(getRfpById)
    },
    onError: (error) => {
      console.error(error)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "Error updating status and schedule.",
      })
    },
  })

  return (
    <Form
      initialValues={{
        status: rfp?.status,
        scheduleEnabled: Boolean(rfp?.startDate || rfp?.endDate),
        startDate: rfp?.startDate ? formatDateForFieldInput(rfp?.startDate) : undefined,
        endDate: rfp?.endDate ? formatDateForFieldInput(rfp?.endDate) : undefined,
      }}
      onSubmit={async (values: any, form) => {
        try {
          const { status, startDate, endDate } = extractStatusValues(values)

          await updateRfpStatusMutation({
            rfpId: rfp?.id as string,
            status,
            startDate,
            endDate,
          })
        } catch {}
      }}
      render={({ form, handleSubmit }) => {
        const formState = form.getState()

        return (
          <form onSubmit={handleSubmit}>
            <RfpStatusFields formState={formState} />
            <Button
              type={ButtonType.Secondary}
              isSubmitType={true}
              isDisabled={formState.invalid || formState.pristine}
              className="mt-6"
            >
              Save
            </Button>
          </form>
        )
      }}
    />
  )
}
