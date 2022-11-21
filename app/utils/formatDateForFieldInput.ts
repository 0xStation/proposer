import { DateTime } from "luxon"

// This util is used to get the min date for a datetime input which is
// only accepted in the format nnnn-nn-nnTnn:nn
export const formatDateForFieldInput = (date: Date) => {
  const dateTime = DateTime.fromJSDate(date)
  const isoDate = DateTime.fromISO(dateTime.toString())

  // date input value needs to match the pattern nnnn-nn-nnTnn:nn
  // but isoDate.toString() returns nnnn-nn-nnTnn:nn:nn.nnn-nn:00
  // so we are slicing off the offset
  return isoDate.toString().slice(0, -13)
}

export default formatDateForFieldInput
