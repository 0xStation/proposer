const createKeccakHash = require("keccak")

// Addresses are case-insensitive unique, but a "checksum" represents an algorithmic
// way to determine the proper casing of an address. All wallet providers leverage
// this checksum algorithm from EIP-55 for determining their address casing.
// Implementation taken from the EIP: https://eips.ethereum.org/EIPS/eip-55
export const toChecksumAddress = (address: string) => {
  if (!address) {
    return ""
  }
  address = address.toLowerCase().replace("0x", "")
  const hash = createKeccakHash("keccak256").update(address).digest("hex")
  let checksummed = "0x"

  for (let i = 0; i < address.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      checksummed += address.substring(i, i + 1).toUpperCase()
    } else {
      checksummed += address[i]
    }
  }

  return checksummed
}
