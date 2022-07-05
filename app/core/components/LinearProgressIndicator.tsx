import { useEffect, useState } from "react"
import * as Progress from "@radix-ui/react-progress"

const LinearProgressIndicator = ({ value, max, color, title }) => {
  const [updatedValue, setValue] = useState(value)

  useEffect(() => {
    if (value) {
      setValue(value)
      if (max === 0) {
        setValue(0)
      }
    }
  }, [value])

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
            // needs to be == because type misalignment? parseInt + `===` does not work?
            transform: `translateX(-${max == 0 ? 100 : ((max - updatedValue) / max) * 100}%)`,
          }}
        />
      </Progress.Root>
    </div>
  )
}
export default LinearProgressIndicator
