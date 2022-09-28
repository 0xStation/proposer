export const MetadataLabel = ({ className = "", label = "" }) => {
  return (
    <div className={className}>
      <h4 className="text-xs font-bold text-concrete uppercase mt-6">{label}</h4>
    </div>
  )
}

export default MetadataLabel
