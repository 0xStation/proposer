// PACKAGE
import { Field } from "react-final-form"
// CORE
import { requiredField } from "app/utils/validators"
// MODULE
import formatDateForFieldInput from "app/core/utils/formatDateForFieldInput"
import { RfpStatus } from "@prisma/client"
import { toTitleCase } from "app/core/utils/titleCase"
import BinarySwitch from "app/core/components/BinarySwitch"
import convertDateFieldInputToDate from "app/core/utils/convertDateFieldInputToDate"

export const extractStatusValues = ({
  status,
  scheduleEnabled,
  startDate,
  endDate,
}): { status: RfpStatus; startDate: Date | null; endDate: Date | null } => {
  const newStatus = scheduleEnabled ? RfpStatus.TIME_DEPENDENT : (status as RfpStatus)
  let newStartDate
  let newEndDate
  if (!scheduleEnabled) {
    newStartDate = null
    newEndDate = null
  } else if (status === RfpStatus.OPEN) {
    newStartDate = new Date()
    newEndDate = convertDateFieldInputToDate(endDate)
  } else {
    newStartDate = convertDateFieldInputToDate(startDate)
    newEndDate = convertDateFieldInputToDate(endDate)
  }

  return { status: newStatus, startDate: newStartDate, endDate: newEndDate }
}

export const RfpStatusFields = ({ formState }) => {
  return (
    <>
      {/* STATUS */}
      <label className="font-bold block mt-6">Status*</label>
      <Field name="status">
        {({ input, meta }) => (
          <>
            <div className="custom-select-wrapper">
              <select {...input} required className="w-full bg-wet-concrete rounded p-2 mt-1">
                <option value={RfpStatus.CLOSED}>{toTitleCase(RfpStatus.CLOSED)}</option>
                <option value={RfpStatus.OPEN}>{toTitleCase(RfpStatus.OPEN)}</option>
              </select>
            </div>
          </>
        )}
      </Field>
      <div className="mt-6 flex flex-row justify-between items-center">
        <h1 className="font-bold">Schedule RFP</h1>
        <Field name="scheduleEnabled">
          {({ input }) => (
            <BinarySwitch name={input.name} value={input.value} onChange={input.onChange} />
          )}
        </Field>
      </div>
      {formState.values.status === RfpStatus.CLOSED && formState.values.scheduleEnabled && (
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
    </>
  )
}

export default RfpStatusFields
