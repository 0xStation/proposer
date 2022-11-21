import { RfpStatus } from "@prisma/client"
import useCountdown from "app/core/hooks/useCountdown"

export const RfpEndsIn = ({ status, endDate }: { status?: RfpStatus; endDate?: Date | null }) => {
  const timeLeft = useCountdown(endDate)
  return (
    <>
      {status === RfpStatus.OPEN && !!endDate && endDate > new Date() && timeLeft && (
        <div>
          <h4 className="text-xs font-bold text-concrete uppercase">Ends in</h4>
          <p className="mt-2 text-lg font-bold">{timeLeft}</p>
        </div>
      )}
    </>
  )
}

export default RfpEndsIn
