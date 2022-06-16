import { toChecksumAddress } from "./checksumAddress"

export const parseUniqueAddresses = (text: string): string[] => {
  const addressRegex = /0x[a-fA-F0-9]{40}/g
  const addresses = text.match(addressRegex) || [] // returns list of substrings fitting regex
  return addresses
    .map((a) => toChecksumAddress(a)) // enforce checksum casing
    .filter((v, i, addresses) => addresses.indexOf(v) === i) // filter out duplicate addresses
}
