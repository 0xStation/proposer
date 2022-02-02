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

export const formatDate = (date) => {
  if (!date) return null
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()

  return `${day}-${monthMapper[month]}-${year}`
}

export default formatDate
