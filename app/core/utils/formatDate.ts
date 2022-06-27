const monthMapper = {
  0: "JAN",
  1: "FEB",
  2: "MAR",
  3: "APR",
  4: "MAY",
  5: "JUN",
  6: "JUL",
  7: "AUG",
  8: "SEP",
  9: "OCT",
  10: "NOV",
  11: "DEC",
}

// formateDate to dd-MM-yyyy, ex:) 01-JAN-2022
export const formatDate = (date: Date, isLocalTime = false) => {
  if (!date) return null

  const day = isLocalTime ? date.getDate() : date.getUTCDate()
  const month = isLocalTime ? date.getMonth() : date.getUTCMonth()
  const year = isLocalTime ? date.getFullYear() : date.getUTCFullYear()

  return `${day}-${monthMapper[month]}-${year}`
}
