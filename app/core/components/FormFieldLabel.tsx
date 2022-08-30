export const FormFieldLabel = ({ className = "", label = "", description = "" }) => {
  return (
    <div className={className}>
      <label className="font-bold block">{label}</label>
      {description && <span className="text-xs text-concrete block">{description}</span>}
    </div>
  )
}

export default FormFieldLabel
