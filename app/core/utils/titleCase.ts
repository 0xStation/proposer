export const titleCase = (testString = "") => {
  return testString
    .trim()
    .toLowerCase()
    .split(" ")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(" ")
}
