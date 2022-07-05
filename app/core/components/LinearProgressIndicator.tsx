import { useState } from "react"
import * as Progress from "@radix-ui/react-progress"

const LinearProgressIndicator = ({ value, max, color, title }) => {
  const [updatedValue, setValue] = useState(value)

  // no matter what value is, if max is 0, value should be 0 as well
  // cannot have x/0
  if (max === 0) {
    setValue(0)
  }

  return (
    <div className="flex flex-col space-y-1">
      <div className="flex justify-between items-center">
        <div className="flex flex-row items-center space-x-1">
          <span className={`h-2 w-2 rounded-full bg-${color}`} />
          <div className="font-bold text-xs uppercase tracking-wider">{title}</div>
        </div>
        <div className="text-xs">
          <span className="text-lg font-bold">{updatedValue}</span> / {max}
        </div>
      </div>
      <Progress.Root
        value={updatedValue}
        max={max}
        className="h-2 w-full bg-concrete relative overflow-hidden"
      >
        <Progress.Indicator
          className={`w-full h-full bg-${color} transition-transform duration-500`}
          style={{
            transform: `translateX(-${max === 0 ? 0 : ((max - updatedValue) / max) * 100}%)`,
          }}
        />
      </Progress.Root>
    </div>
  )
}
export default LinearProgressIndicator
