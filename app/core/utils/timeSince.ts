const timeSince = (date) => {
  const now = new Date()
  const secondsPast = (now.getTime() - date.getTime()) / 1000
  if (secondsPast < 60) {
    return (secondsPast | 0) + "s ago"
  }
  if (secondsPast < 3600) {
    return ((secondsPast / 60) | 0) + "m ago"
  }
  if (secondsPast <= 86400) {
    return ((secondsPast / 3600) | 0) + "h ago"
  }
  if (secondsPast > 86400) {
    const day = date.getDate()
    const month = date
      .toDateString()
      .match(/ [a-zA-Z]*/)[0]
      .replace(" ", "")
    const year = date.getFullYear() === now.getFullYear() ? "" : " " + date.getFullYear()
    return day + " " + month + year
  }
}

export default timeSince
