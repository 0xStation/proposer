import { EditIcon } from "./EditIcon"

const ToolTip = ({ children }) => {
  return (
    <div className="hidden bg-wet-concrete invisible group-hover:visible md:inline rounded p-2 mr-1.5">
      {children}
    </div>
  )
}

export const EditIconAndTooltip = ({
  editCopy,
  toolTipCopy,
  disabled = false,
  onClick,
  className = "",
}: {
  editCopy?: string
  toolTipCopy?: string
  disabled?: boolean
  onClick?: () => void
  className?: string
}) => {
  return (
    <div className={`relative group float-right ${className}`}>
      <ToolTip>{toolTipCopy}</ToolTip>
      <EditIcon disabled={disabled} onClick={onClick}>
        {editCopy}
      </EditIcon>
    </div>
  )
}
