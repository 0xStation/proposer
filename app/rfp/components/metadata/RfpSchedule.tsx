import { RfpStatus } from "@prisma/client"
import useCountdown from "app/core/hooks/useCountdown"

export const RfpSchedule = ({
  status,
  startDate,
  endDate,
}: {
  status?: RfpStatus
  startDate?: Date | null
  endDate?: Date | null
}) => {
  const timeTillOpen = useCountdown(startDate)
  const timeTillClose = useCountdown(endDate)

  const showStartsIn =
    status === RfpStatus.CLOSED && !!startDate && startDate > new Date() && timeTillOpen
  const showEndsIn = status === RfpStatus.OPEN && !!endDate && endDate > new Date() && timeTillClose

  return (
    <>
      {(showStartsIn || showEndsIn) && (
        <div>
          <h4 className="text-xs font-bold text-concrete uppercase">
            {showStartsIn ? "Starts" : "Ends"} in
          </h4>
          <p className="mt-2 text-lg font-bold">{showStartsIn ? timeTillOpen : timeTillClose}</p>
        </div>
      )}
    </>
  )
}

export default RfpSchedule
