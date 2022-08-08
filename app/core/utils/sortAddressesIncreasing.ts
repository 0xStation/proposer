import { BigNumber } from "@ethersproject/bignumber"

// used to sort address lists before sending them in a smart contract transaction
// address ordering is often used so that contracts can validate no duplicate items
export const sortAddressesIncreasing = (addresses: string[]): string[] => {
  return addresses
    .map((a) => BigNumber.from(a)) // convert addresses to BigNumbers
    .sort((a, b) => (a.gt(b) ? 1 : -1)) // sort addresses in increasing order
    .map((n) => n.toHexString()) // convert BigNumbers back to addresses
}
