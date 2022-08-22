export const addressesAreEqual = (address1: string, address2: string) => {
  // addresses may be in different casing, so lower both to compare
  return address1?.toLowerCase() === address2?.toLowerCase()
}
