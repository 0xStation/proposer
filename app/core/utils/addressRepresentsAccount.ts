import { AddressType } from "@prisma/client"
import { addressesAreEqual } from "./addressesAreEqual"

export const addressRepresentsAccount = (address, account): boolean => {
  return (
    // account is WALLET and active user is address
    (account?.addressType === AddressType.WALLET && addressesAreEqual(account.address, address)) ||
    // account is SAFE and active user is a signer
    (account?.addressType === AddressType.SAFE &&
      account?.data?.signers?.some((signer) => addressesAreEqual(signer, address)))
  )
}
