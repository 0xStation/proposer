import { DateTime } from "luxon"

export const convertDateStringToDateAndTime = ({ timestamp = "" }) => {
  return `${DateTime.fromISO(timestamp as string).toFormat("dd-MMM-yyyy")} 
      ${DateTime.fromISO(timestamp as string).toLocaleString(DateTime.TIME_SIMPLE)}`
}
