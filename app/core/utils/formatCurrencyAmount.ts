// formateDate to XXX,XXX.XX, e.g. 12,345.67
export const formatCurrencyAmount = (amount: string | undefined): string => {
  if (!amount) {
    return "0.00"
  }
  // TODO: convert large numbers that use scientific notation to shorthand thousand, million, billion, trillion, etc.
  if (amount.includes("e")) return amount
  const [integer, decimal] = amount.split(".")
  return parseInt(integer || "0")?.toLocaleString("en-US") + "." + (decimal || "00")
}
