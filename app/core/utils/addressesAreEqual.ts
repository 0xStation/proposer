export const addressesAreEqual = (address1: string | undefined, address2: string | undefined) => {
  // addresses may be in different casing, so lower both to compare
  return !address1 || !address2 ? false : address1.toLowerCase() === address2.toLowerCase()
}
