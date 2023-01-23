import { Field } from "react-final-form"

export const TextareaField = ({
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
      <Field name={fieldName}>
        {({ input, meta }) => (
          <>
            <textarea
              {...input}
              placeholder={placeholder}
              rows={4}
              className="mt-1 p-2 bg-wet-concrete text-marble-white rounded w-full"
            />
            {/* this error shows up when the user focuses the field (meta.touched) */}
            {meta.error && meta.touched && (
              <span className=" text-xs text-torch-red block">{meta.error}</span>
            )}
          </>
        )}
      </Field>
    </>
  )
}

export default TextareaField
