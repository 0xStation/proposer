import { ProposalRoleType } from "@prisma/client"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"

export const useAccountTags = (proposal, roles, roleType) => {
  let accountTagsMap = {}
  if (roleType === ProposalRoleType.CONTRIBUTOR) {
    roles
      ?.map((role) => role.address)
      ?.filter((v, i, addresses) => addresses.indexOf(v) === i)
      ?.forEach((address) => {
        if (
          proposal.payments.some((payment) => addressesAreEqual(payment.recipientAddress, address))
        ) {
          accountTagsMap[address] = ["payment recipient"]
        }
      })
  } else if (roleType === ProposalRoleType.CLIENT) {
    roles
      ?.map((role) => role.address)
      ?.filter((v, i, addresses) => addresses.indexOf(v) === i)
      ?.forEach((address) => {
        if (
          proposal.payments.some((payment) => addressesAreEqual(payment.senderAddress, address))
        ) {
          accountTagsMap[address] = ["payer"]
        }
      })
  }

  return { accountTagsMap }
}
