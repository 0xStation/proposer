import { BigNumber } from "ethers"

export const sortAddresses = (addresses: string[]): string[] => {
  return addresses
    .map((a) => BigNumber.from(a)) // convert addresses to BigNumbers
    .sort((a, b) => (a.gt(b) ? 1 : -1)) // sort addresses in increasing order
    .map((n) => n.toHexString()) // convert BigNumbers back to addresses
}
