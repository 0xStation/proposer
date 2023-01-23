export const MetadataItem = ({ label, children }) => {
  return (
    <div>
      <p className="text-sm text-concrete uppercase font-medium mb-2">{label}</p>
      {children}
    </div>
  )
}

export default MetadataItem
