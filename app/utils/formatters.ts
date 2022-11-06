// only register typing 0-9 and one decimal
export const formatTokenAmount = (amount: string): string => {
  // strip commas for case where input is pasted from another page
  const commaStripped = (amount || "").replaceAll(",", "")
  // pad zero infront of decimal
  const zeroPadded = commaStripped.substring(0, 1) === "." ? "0" + commaStripped : commaStripped
  // supports one or no period, plus/minus sign not supported, forked from: https://regexland.com/regex-decimal-numbers/
  const decimalRegex = /([0-9]+\.?[0-9]*|\.[0-9]+)/
  const regexMatches = zeroPadded.match(decimalRegex) || [""]
  // only keep the first match i.e. throw away non-matching characters/sequences
  const parsedValue = regexMatches[0]!
  return parsedValue
}

export const formatPercentValue = (value: string): string => {
  // pad zero infront of decimal
  const zeroPadded = (value || "").substring(0, 1) === "." ? "0" + value : value || ""
  // supports one or no period, plus/minus sign not supported, forked from: https://regexland.com/regex-decimal-numbers/
  const decimalRegex = /([0-9]+\.?[0-9]*|\.[0-9]+)/
  const regexMatches = zeroPadded.match(decimalRegex) || [""]
  // only keep the first match i.e. throw away non-matching characters/sequences
  const parsedValue = regexMatches[0]!

  const [integer, decimal] = parsedValue.split(".")
  // allow up to two decimal places
  const decimalCapped =
    decimal !== undefined
      ? parseInt(integer || "0") + "." + decimal?.substring(0, Math.min(decimal.length, 2)) || ""
      : integer || ""

  return decimalCapped
}

// only register typing 0-9
export const formatPositiveInt = (amount: string): string => {
  // strip commas for case where input is pasted from another page
  const commaStripped = (amount || "").replaceAll(",", "")
  // remove zero pad
  const zeroStripped =
    commaStripped.substring(0, 1) === "0"
      ? commaStripped.substring(1, commaStripped.length)
      : commaStripped
  // supports one or no period, plus/minus sign not supported, forked from: https://regexland.com/regex-decimal-numbers/
  const integerRegex = /([0-9]+)/
  const regexMatches = zeroStripped.match(integerRegex) || [""]
  // only keep the first match i.e. throw away non-matching characters/sequences
  const parsedValue = regexMatches[0]!
  return parsedValue
}

export const formatTrimLeadingSpace = (text: string): string => {
  const leadingSpaceRegex = /^\s+/g
  return text?.replaceAll(leadingSpaceRegex, "") || ""
}
