// only register typing 0-9 and one decimal
export const formatTokenAmount = (amount: string): string => {
  const commaStripped = (amount || "").replaceAll(",", "")
  // supports one or no period, plus/minus sign not supported, forked from: https://regexland.com/regex-decimal-numbers/
  const decimalRegex = /([0-9]+\.?[0-9]*|\.[0-9]+)/
  const regexMatches = commaStripped.match(decimalRegex) || [""]
  // only keep the first match i.e. throw away non-matching characters/sequences
  return regexMatches[0]!
}
