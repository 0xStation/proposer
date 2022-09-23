import ProgressIndicator from "./ProgressIndicator"

export const ProgressCircleAndNumber = ({ className = "", numerator = 0, denominator = 1 }) => {
  return (
    <div className="flex flex-row space-x-2 items-center">
      <ProgressIndicator
        percent={numerator / denominator} // filter out duplicate addresses}
        twsize={6}
        cutoff={0}
      />
      <p>
        {numerator}/{denominator}
      </p>
    </div>
  )
}

export default ProgressCircleAndNumber