export const ToolTip = ({ children, className = "" }) => {
  return (
    <div
      className={`text-sm hidden bg-wet-concrete invisible group-hover:visible md:inline rounded p-2 ${className}`}
    >
      {children}
    </div>
  )
}
