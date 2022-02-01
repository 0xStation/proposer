export const truncateString = (inputString = "") => {
  if (inputString.length > 20) {
    return (
      inputString.substr(0, 5) +
      "..." +
      inputString.substr(inputString.length - 5, inputString.length)
    )
  }
  return inputString
}

export default truncateString
