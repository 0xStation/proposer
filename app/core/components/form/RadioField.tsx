import { Field } from "react-final-form"

export const RadioField = ({
  fieldName,
  value,
  label,
}: {
  fieldName: string
  value: string
  label: string
}) => {
  return (
    <Field name={fieldName} type="radio" value={value}>
      {({ input }) => {
        return (
          <div className="flex flex-row space-x-2 items-center">
            <input {...input} type="radio" className="h-4 w-4 accent-electric-violet" />
            <label>{label}</label>
          </div>
        )
      }}
    </Field>
  )
}

export default RadioField
