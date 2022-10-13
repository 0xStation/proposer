// formateDate to XXX,XXX.XX, e.g. 12,345.67
export const formatCurrencyAmount = (amount: any | undefined): string => {
  if (!amount) {
    return "0.00"
  }
  if (amount.includes("e")) return amount
  const [integer, decimal] = amount.split(".")
  return parseInt(integer || "0")?.toLocaleString("en-US") + "." + (decimal || "00")
}
