import { useEffect } from "react"

// hook to refresh the RFP based on a start or end date
export const useScheduleCallback = ({ callback, date }) => {
  useEffect(() => {
    if (!date) return
    const delay = date.getTime() - Date.now()
    if (delay < 0) return
    // set timer to refresh RFP detail view once we hit refresh date
    setTimeout(() => {
      callback()
    }, delay)
  }, [date])
}
