// formateDate to XXX,XXX.XX, e.g. 12,345.67
export const formatCurrencyAmount = (amount: string | undefined) => {
  if (!amount) {
    return "0.00"
  }
  const [integer, decimal] = amount.split(".")
  return (
    parseInt(integer || "0")?.toLocaleString("en-US") + "." + (decimal?.substring(0, 2) || "00")
  )
}
