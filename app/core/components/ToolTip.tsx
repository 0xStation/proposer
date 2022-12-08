export const ToolTip = ({ children }) => {
  return (
    <div className="text-sm hidden bg-wet-concrete invisible group-hover:visible md:inline rounded h-fit px-1">
      {children}
    </div>
  )
}
