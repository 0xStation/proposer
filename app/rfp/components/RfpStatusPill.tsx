import { RFP_STATUS_DISPLAY_MAP } from "app/core/utils/constants"

export const RfpStatusPill = ({ status }) => {
  return (
    <span
      className={`${RFP_STATUS_DISPLAY_MAP[status]?.color} bg-wet-concrete rounded-full px-2 py-1 flex items-center space-x-1 w-fit`}
    >
      <span className="text-xs uppercase text-tunnel-black font-bold">
        {RFP_STATUS_DISPLAY_MAP[status]?.copy || "awaiting signatures"}
      </span>
    </span>
  )
}

export default RfpStatusPill
