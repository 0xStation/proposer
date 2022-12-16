export const ToolTip = ({ children, className }: { children: any; className?: string }) => {
  return (
    <div
      className={`${className} hidden bg-wet-concrete invisible group-hover:visible md:inline rounded p-2 mr-1.5`}
    >
      {children}
    </div>
  )
}

export default ToolTip
