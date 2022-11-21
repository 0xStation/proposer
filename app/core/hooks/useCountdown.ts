import { useEffect, useState } from "react"

const useCountdown = (date?: Date | null) => {
  const calculateTimeLeft = () => {
    if (!date) return ""
    const now = new Date()
    const totalSeconds = (date.getTime() - now.getTime()) / 1000
    const minutes = 60
    const hours = 60 * minutes
    const days = 24 * hours

    const daysLeft = Math.floor(totalSeconds / days)
    const hoursLeft = Math.floor((totalSeconds % days) / hours)
    const minutesLeft = Math.floor((totalSeconds % hours) / minutes)
    const secondsLeft = Math.floor(totalSeconds % minutes)

    return daysLeft
      ? daysLeft + " days"
      : hoursLeft
      ? hoursLeft + " hours"
      : minutesLeft + " min " + secondsLeft + " sec"
  }

  const [timeLeft, setTimeLeft] = useState<string>(calculateTimeLeft())

  useEffect(() => {
    // set repeating timer if time left includes seconds
    setTimeout(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
  })

  return timeLeft
}

export default useCountdown
