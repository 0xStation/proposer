import { AddressType } from "@prisma/client"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { useParticipants } from "./useParticipants"

export const useCheckUserIsParticipant = (proposalId, userAddress) => {
  const participants = useParticipants(proposalId)

  return (
    participants?.some(
      (participant) =>
        // account is WALLET and active user is address
        (participant?.account?.addressType === AddressType.WALLET &&
          addressesAreEqual(participant?.accountAddress, userAddress)) ||
        // account is SAFE and active user is a signer
        (participant?.account?.addressType === AddressType.SAFE &&
          participant?.account?.data?.signers?.some((signer) =>
            addressesAreEqual(signer, userAddress)
          ))
    ) || false
  )
}
