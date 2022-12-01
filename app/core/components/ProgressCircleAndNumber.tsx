import ProgressIndicator from "./ProgressIndicator"

export const ProgressCircleAndNumber = ({ className = "", numerator = 0, denominator = 1 }) => {
  return (
    <div className="flex flex-row space-x-1 items-center">
      <ProgressIndicator
        percent={denominator === 0 ? 0 : numerator / denominator} // filter out duplicate addresses}
        twsize={4}
        cutoff={0}
      />
      <p>
        {numerator}/{denominator}
      </p>
    </div>
  )
}

export default ProgressCircleAndNumber
