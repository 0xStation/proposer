import { convertJSDateToDateAndTime } from "../utils/convertJSDateToDateAndTime"

export const TotalPaymentView = ({
  startDate,
  endDate,
  className,
}: {
  startDate: Date
  endDate?: Date
  className?: string
}) => {
  return startDate ? (
    <div className={`${className} border border-b border-concrete rounded-2xl px-6 py-9`}>
      <h2 className="font-bold text-xl">Timeline</h2>
      {startDate && (
        <div className="uppercase mt-6">
          <h4 className="text-xs font-bold text-concrete uppercase">Start date</h4>
          <p className="mt-2">{convertJSDateToDateAndTime({ timestamp: startDate as Date })}</p>
        </div>
      )}
      {endDate && (
        <div className="mt-6 uppercase">
          <h4 className="text-xs font-bold text-concrete">End date</h4>
          <p className="mt-2">{convertJSDateToDateAndTime({ timestamp: endDate as Date })}</p>
        </div>
      )}
    </div>
  ) : (
    <div className="h-[200px] bg-wet-concrete shadow rounded-2xl motion-safe:animate-pulse" />
  )
}

export default TotalPaymentView
