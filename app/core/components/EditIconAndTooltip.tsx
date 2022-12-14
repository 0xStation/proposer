import { EditIcon } from "./EditIcon"
import ToolTip from "./Tooltip"

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
