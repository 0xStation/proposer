import { Prisma } from "@prisma/client"
import { utils } from "ethers"

const decimalToBigNumber = (value, decimals: number) => {
  const n = new Prisma.Decimal(value)
  return utils.parseUnits(n.toFixed(decimals), decimals)
}

export default decimalToBigNumber
