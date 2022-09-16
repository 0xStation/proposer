import { DateTime } from "luxon"

export const convertJSDateToDateAndTime = ({ timestamp }: { timestamp: Date }) => {
  return `${DateTime.fromJSDate(timestamp as Date).toFormat("dd-MMM-yyyy")} 
    ${DateTime.fromJSDate(timestamp as Date).toLocaleString(DateTime.TIME_SIMPLE)}`
}

export default convertJSDateToDateAndTime
