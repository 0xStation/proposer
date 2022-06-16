export const parseUniqueAddresses = (text: string): string[] => {
  const addressRegex = /0x[a-fA-F0-9]{40}/g
  const addresses = text.match(addressRegex) || [] // returns list of substrings fitting regex
  return addresses.filter((v, i, addresses) => addresses.indexOf(v) === i)
}
