// only register typing 0-9 and one decimal
export const formatTokenAmount = (amount: string): string => {
  // strip commas for case where input is pasted from another page
  const commaStripped = (amount || "").replaceAll(",", "")
  // pad zero infront of decimal for case where input is pasted
  const zeroPadded = commaStripped.substring(0, 1) === "." ? "0" + commaStripped : commaStripped
  // supports one or no period, plus/minus sign not supported, forked from: https://regexland.com/regex-decimal-numbers/
  const decimalRegex = /([0-9]+\.?[0-9]*|\.[0-9]+)/
  const regexMatches = zeroPadded.match(decimalRegex) || [""]
  // only keep the first match i.e. throw away non-matching characters/sequences
  return regexMatches[0]!
}

export const formatPercentValue = (value: string): string => {
  const decimalRegex = /([0-9]+\.?[0-9]*|\.[0-9]+)/
  const regexMatches = (value || "").match(decimalRegex) || [""]
  const parsedValue = regexMatches[0]!

  const [integer, decimal] = parsedValue.split(".")
  const decimalCapped =
    decimal !== undefined
      ? parseInt(integer || "0")?.toLocaleString("en-US") +
          "." +
          decimal?.substring(0, Math.min(decimal.length, 2)) || ""
      : integer || ""

  return decimalCapped
}
