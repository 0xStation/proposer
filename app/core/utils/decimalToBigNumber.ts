import { Prisma } from "@prisma/client"
import { parseUnits } from "@ethersproject/units"

const decimalToBigNumber = (value, decimals: number) => {
  // use Prisma.Decimal to fix scientific notation on large numbers (e.g. 1e50)
  const n = new Prisma.Decimal(value).toFixed(decimals)
  return parseUnits(n, decimals)
}

export default decimalToBigNumber
