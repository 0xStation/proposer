import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import { RfpStatus } from "@prisma/client"
import BinarySwitch from "app/core/components/BinarySwitch"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useStore from "app/core/hooks/useStore"
import formatDateForFieldInput from "app/utils/formatDateForFieldInput"
import { DateTime } from "luxon"
import { Field, Form } from "react-final-form"
import { requiredField } from "../../utils/validators"
import updateRfpStatus from "../mutations/updateRfpStatus"
import getRfpById from "../queries/getRfpById"
import { Rfp } from "../types"
import RfpStatusPill from "./RfpStatusPill"

const overrideToastMessage = {
  [RfpStatus.OPEN]: {
    success: "Successfully opened RFP.",
    error: "Error opening RFP.",
  },
  [RfpStatus.CLOSED]: {
    success: "Successfully closed RFP.",
    error: "Error closing RFP.",
  },
}

export const RfpStatusForm = ({ rfp }: { rfp?: Rfp | null }) => {
  const setToastState = useStore((state) => state.setToastState)

  const [updateRfpStatusMutation] = useMutation(updateRfpStatus, {
    onSuccess: (data) => {
      invalidateQuery(getRfpById)
    },
    onError: (error) => {
      console.error(error)
    },
  })

  const overrideRfpStatus = async (status: RfpStatus) => {
    try {
      const updatedStatus = await updateRfpStatusMutation({
        rfpId: rfp?.id as string,
        status,
        startDate: null,
        endDate: null,
      })
      if (updatedStatus) {
        setToastState({
          isToastShowing: true,
          type: "success",
          message: overrideToastMessage[status].success,
        })
      }
    } catch (err) {
      setToastState({
        isToastShowing: true,
        type: "error",
        message: overrideToastMessage[status].error,
      })
    }
  }

  return (
    <Form
      initialValues={{
        scheduleEnabled: Boolean(rfp?.startDate || rfp?.endDate),
        startDate: rfp?.startDate ? formatDateForFieldInput(rfp?.startDate) : undefined,
        endDate: rfp?.endDate ? formatDateForFieldInput(rfp?.endDate) : undefined,
      }}
      onSubmit={async (values: any, form) => {
        try {
          const updatedStatus = await updateRfpStatusMutation({
            rfpId: rfp?.id as string,
            status: values.scheduleEnabled ? RfpStatus.TIME_DEPENDENT : (rfp?.status as RfpStatus),
            // convert luxon's `DateTime` obj to UTC to store in db
            ...(!values.scheduleEnabled
              ? {
                  startDate: null,
                  endDate: null,
                }
              : {
                  startDate: values.startDate
                    ? DateTime.fromISO(values.startDate).toUTC().toJSDate()
                    : new Date(),
                  endDate: values.endDate
                    ? DateTime.fromISO(values.endDate).toUTC().toJSDate()
                    : null,
                }),
          })
          if (updatedStatus) {
            setToastState({
              isToastShowing: true,
              type: "success",
              message: "Successfully set schedule.",
            })
          }
        } catch (err) {
          console.error(err)
          setToastState({
            isToastShowing: true,
            type: "error",
            message: "Error setting schedule.",
          })
        }
      }}
      render={({ form, handleSubmit }) => {
        const formState = form.getState()

        return (
          <form onSubmit={handleSubmit}>
            <h1 className="font-bold mt-5 mb-3">Current status</h1>
            <RfpStatusPill status={rfp?.status} />
            <Button
              type={ButtonType.Secondary}
              className="max-w-fit mt-3"
              onClick={async () =>
                overrideRfpStatus(
                  rfp?.status === RfpStatus.OPEN ? RfpStatus.CLOSED : RfpStatus.OPEN
                )
              }
            >
              {rfp?.status === RfpStatus.OPEN ? "Close RFP" : "Open RFP"}
            </Button>
            <div className="mt-5 flex flex-row justify-between items-center">
              <h1 className="font-bold">Schedule RFP</h1>
              <Field name="scheduleEnabled">
                {({ input }) => (
                  <BinarySwitch name={input.name} value={input.value} onChange={input.onChange} />
                )}
              </Field>
            </div>
            {rfp?.status === RfpStatus.CLOSED && formState.values.scheduleEnabled && (
              <>
                {/* START DATE */}
                <label className="font-bold block mt-6">Start date*</label>
                <Field name="startDate" validate={requiredField}>
                  {({ input, meta }) => {
                    return (
                      <div>
                        <input
                          {...input}
                          type="datetime-local"
                          min={formatDateForFieldInput(new Date())}
                          max={formState.values.endDate}
                          className="bg-wet-concrete rounded p-2 mt-1 w-full"
                        />
                        {meta.touched && meta.error && (
                          <span className="text-torch-red text-xs">{meta.error}</span>
                        )}
                      </div>
                    )
                  }}
                </Field>
              </>
            )}
            {formState.values.scheduleEnabled && (
              <>
                {/* END DATE */}
                <label className="font-bold block mt-6">End date*</label>
                <Field name="endDate" validate={requiredField}>
                  {({ input, meta }) => {
                    return (
                      <div>
                        <input
                          {...input}
                          type="datetime-local"
                          min={formState.values.startDate || formatDateForFieldInput(new Date())}
                          className="bg-wet-concrete rounded p-2 mt-1 w-full"
                        />
                        {meta.touched && meta.error && (
                          <span className="text-torch-red text-xs">{meta.error}</span>
                        )}
                      </div>
                    )
                  }}
                </Field>
              </>
            )}
            <Button
              type={ButtonType.Secondary}
              isSubmitType={true}
              isDisabled={formState.invalid || formState.pristine}
              className="mt-5"
            >
              Save
            </Button>
          </form>
        )
      }}
    />
  )
}
