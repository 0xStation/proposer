export function getWalletString(address: string, ens?: string) {
  // query for ENS on Ethereum mainnet

  // check if hardcoded ENS
  if (ens) {
    return ens
  }
  // if no ENS, take beginning and end of address
  return `${address.substring(0, 5)}...${address.substring(39, 42)}`
}
