import { PROPOSAL_NEW_STATUS_DISPLAY_MAP } from "../utils/constants"

export const ProposalStatusPill = ({ status }) => {
  return (
    <span
      className={`${PROPOSAL_NEW_STATUS_DISPLAY_MAP[status]?.color} bg-wet-concrete rounded-full px-2 py-1 flex items-center space-x-1 w-fit`}
    >
      <span className="text-xs uppercase text-tunnel-black font-bold">
        {PROPOSAL_NEW_STATUS_DISPLAY_MAP[status]?.copy || "awaiting signatures"}
      </span>
    </span>
  )
}

export default ProposalStatusPill
