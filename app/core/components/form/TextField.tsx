import { Field } from "react-final-form"
import { requiredField } from "app/utils/validators"

export const TextField = ({
  title,
  subtitle,
  placeholder,
  fieldName,
}: {
  title: string
  subtitle?: string
  placeholder?: string
  fieldName: string
}) => {
  return (
    <>
      <label className="font-bold block mt-6">{title}</label>
      {subtitle && <span className="text-xs text-concrete block">{subtitle}</span>}
      <Field name={fieldName} validate={requiredField} disabled={false}>
        {({ input, meta }) => {
          return (
            <>
              <input
                {...input}
                type="text"
                className="w-full bg-wet-concrete rounded mt-1 p-2"
                placeholder={placeholder || ""}
              />
              {meta.touched && meta.error && (
                <span className="text-torch-red text-xs">{meta.error}</span>
              )}
            </>
          )
        }}
      </Field>
    </>
  )
}
