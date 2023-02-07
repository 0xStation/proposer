import ProgressCircleAndNumber from "app/core/components/ProgressCircleAndNumber"
import { Check, CheckStatus } from "../types"
import useCheckStatus from "../hooks/useCheckStatus"

export const CheckStatusIndicator = ({
  check,
  hideCounter = false,
}: {
  check?: Check
  hideCounter?: boolean
}) => {
  const { status, validSignatures, quorum } = useCheckStatus({ check })

  const config = {
    [CheckStatus.PENDING]: {
      bg: "bg-neon-carrot",
      copy: CheckStatus.PENDING,
    },
    [CheckStatus.READY]: {
      bg: "bg-magic-mint",
      copy: CheckStatus.READY,
    },
    [CheckStatus.EXECUTED]: {
      bg: "bg-neon-blue",
      copy: CheckStatus.EXECUTED,
    },
  }

  return (
    <div className="flex flex-row space-x-2">
      {/* PILL */}
      <span
        className={`${config[status].bg} rounded-full px-2 py-1 w-fit text-xs uppercase text-tunnel-black`}
      >
        {config[status].copy}
      </span>
      {!hideCounter && status === CheckStatus.PENDING && (
        <ProgressCircleAndNumber numerator={validSignatures} denominator={quorum} />
      )}
    </div>
  )
}
