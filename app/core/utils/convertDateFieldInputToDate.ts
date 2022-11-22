import { DateTime } from "luxon"

export const convertDateFieldInputToDate = (date: string): Date => {
  return DateTime.fromISO(date).toUTC().toJSDate()
}

export default convertDateFieldInputToDate
