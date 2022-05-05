export const truncateString = (inputString = "", numberOfLettersOnEachSide = 5) => {
  if (numberOfLettersOnEachSide > 10) {
    numberOfLettersOnEachSide = 5
  }
  if (inputString.length > 20) {
    return (
      inputString.substr(0, numberOfLettersOnEachSide) +
      "..." +
      inputString.substr(inputString.length - numberOfLettersOnEachSide, inputString.length)
    )
  }
  return inputString
}

export default truncateString
