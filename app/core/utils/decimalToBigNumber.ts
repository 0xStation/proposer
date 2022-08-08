import { Prisma } from "@prisma/client"
import { parseUnits } from "@ethersproject/units"

const decimalToBigNumber = (value, decimals: number) => {
  const n = new Prisma.Decimal(value)
  return parseUnits(n.toFixed(decimals), decimals)
}

export default decimalToBigNumber
