import { Field } from "react-final-form"
import { requiredField } from "app/utils/validators"
import { formatPositiveInt } from "app/utils/formatters"

export const IntegerField = ({
  fieldName,
  min,
  max,
  required = true,
  disabled = false,
  width = "w-full",
}: {
  fieldName: string
  min?: number
  max?: number
  required?: boolean
  disabled?: boolean
  width?: string
}) => {
  return (
    <>
      <Field
        name={fieldName}
        validate={required ? requiredField : () => {}}
        format={formatPositiveInt}
      >
        {({ input }) => {
          return (
            <div className={width}>
              <input
                {...input}
                type="number"
                min={min}
                max={max}
                disabled={disabled}
                className="bg-wet-concrete rounded p-2 mt-1 w-full text-marble-white disabled:text-concrete"
              />
            </div>
          )
        }}
      </Field>
    </>
  )
}

export default IntegerField
