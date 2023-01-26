import { Field } from "react-final-form"
import { requiredField } from "app/utils/validators"
import formatDateForFieldInput from "app/core/utils/formatDateForFieldInput"

export const DatetimeField = ({
  title,
  subtitle,
  fieldName,
  minDate,
  maxDate,
  required = true,
}: {
  title: string
  subtitle?: string
  fieldName: string
  minDate?: Date
  maxDate?: Date
  required?: boolean
}) => {
  return (
    <>
      <label className="font-bold block mt-6">{title}</label>
      {subtitle && <span className="text-xs text-concrete block">{subtitle}</span>}
      <Field name={fieldName} validate={required ? requiredField : () => {}}>
        {({ input, meta }) => {
          return (
            <div>
              <input
                {...input}
                type="datetime-local"
                min={formatDateForFieldInput(minDate)}
                max={formatDateForFieldInput(maxDate)}
                className="w-1/2 bg-wet-concrete rounded p-2 mt-1 w-full text-marble-white"
              />
              {meta.touched && meta.error && (
                <span className="text-torch-red text-xs">{meta.error}</span>
              )}
            </div>
          )
        }}
      </Field>
    </>
  )
}

export default DatetimeField
