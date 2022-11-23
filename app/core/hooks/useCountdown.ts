import { useEffect, useState } from "react"

const seconds = 1000
const minutes = 60 * seconds
const hours = 60 * minutes
const days = 24 * hours

const countdownString = (date?: Date) => {
  const delay = date ? date.getTime() - Date.now() : 0
  const daysLeft = Math.floor(delay / days)
  const hoursLeft = Math.floor((delay % days) / hours)
  const minutesLeft = Math.floor((delay % hours) / minutes)
  const secondsLeft = Math.floor((delay % minutes) / seconds)

  return daysLeft > 0
    ? daysLeft + " days"
    : hoursLeft > 0
    ? hoursLeft + " hours"
    : minutesLeft > 0
    ? minutesLeft + " min " + secondsLeft + " sec"
    : secondsLeft > 0
    ? secondsLeft + " sec"
    : ""
}

const useCountdown = (date?: Date | null) => {
  const [countdown, setCountdown] = useState<string>()

  // set timer to refresh RFP detail view once we hit refresh date
  useEffect(() => {
    if (!date) return
    const timeDelta = date.getTime() - Date.now()
    if (timeDelta < 0) return
    if (countdownString(date) != countdown) {
      setCountdown(countdownString(date))
    }
    if (timeDelta < 1 * hours) {
      const refresh = 1 * seconds
      setTimeout(() => {
        setCountdown(countdownString(date))
      }, refresh)
    } else if (timeDelta < 2 * hours) {
      const refresh = timeDelta - 1 * hours
      setTimeout(() => {
        setCountdown(countdownString(date))
      }, refresh)
    } else if (timeDelta < 24 * hours) {
      const refresh = 1 * hours
      setTimeout(() => {
        setCountdown(countdownString(date))
      }, refresh)
    }
  }, [date, countdown])

  return countdown
}

export default useCountdown
