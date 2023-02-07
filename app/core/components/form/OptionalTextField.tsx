import { Field } from "react-final-form"

export const OptionalTextField = ({
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
      <Field name={fieldName} disabled={false}>
        {({ input, meta }) => {
          return (
            <>
              <input
                {...input}
                type="text"
                className="w-full bg-wet-concrete rounded mt-1 p-2"
                placeholder={placeholder || ""}
              />
            </>
          )
        }}
      </Field>
    </>
  )
}
