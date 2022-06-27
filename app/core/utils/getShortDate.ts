// get yyyy-mm-dd. ex) 2022-01-01
export const getShortDate = (date = new Date(), isLocalTime = false) => {
  if (!date) return
  const dd = String(isLocalTime ? date.getDate() : date.getUTCDate()).padStart(2, "0")
  const mm = String((isLocalTime ? date.getMonth() : date.getUTCMonth()) + 1).padStart(2, "0") // January is 0
  const yyyy = isLocalTime ? date.getFullYear() : date.getUTCFullYear()

  return yyyy + "-" + mm + "-" + dd
}

export default getShortDate
