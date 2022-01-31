export function getWalletString(address: String) {
  // query for ENS on Ethereum mainnet

  // if no ENS, take beginning and end of address
  return `${address.substring(0, 5)}...${address.substring(39, 42)}`
}
