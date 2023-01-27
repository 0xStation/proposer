export const InlineEdit = ({
  handleSubmit,
  value,
  setValue,
  fieldName = "Field name",
  className,
  props,
}: {
  handleSubmit: any
  value: any
  setValue: any
  fieldName?: string
  className?: string
  props?: any
}) => {
  const onChange = (event) => setValue(event.target.value)

  return (
    <input
      className={`bg-transparent border-none hover:cursor-pointer bg-wet-concrete ${className}`}
      aria-label={fieldName}
      value={value}
      onChange={onChange}
      onBlur={handleSubmit}
      {...props}
    />
  )
}

export default InlineEdit
