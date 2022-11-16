export const truncateString = (inputString = "", numberOfLettersOnEachSide = 3) => {
  if (numberOfLettersOnEachSide > 10) {
    numberOfLettersOnEachSide = 3
  }
  if (inputString.length > 20) {
    return (
      inputString.substr(0, 2 + numberOfLettersOnEachSide) +
      "..." +
      inputString.substr(inputString.length - numberOfLettersOnEachSide, inputString.length)
    )
  }
  return inputString
}

export default truncateString
