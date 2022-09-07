import { Account, AccountMetadata } from "app/account/types"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { getGnosisSafeDetails } from "app/utils/getGnosisSafeDetails"
import db, { AddressType } from "db"
import * as z from "zod"

const GetProposalRoles = z.object({
  proposalId: z.string(),
})

export default async function getProposalRoles(input: z.infer<typeof GetProposalRoles>) {
  const params = GetProposalRoles.parse(input)

  const roles = await db.proposalRole.findMany({
    where: { proposalId: params.proposalId },
    include: {
      account: true,
    },
  })

  const accounts = {}
  const requests: any[] = []

  roles.forEach((role) => {
    // accounts[role.address] = { role: role.role, ...role.account }
    if (role.account.type === AddressType.SAFE) {
      const chainId = (role.account.data as AccountMetadata).chainId
      if (!chainId) {
        console.error("missing chainId")
        return
      }
      requests.push(getGnosisSafeDetails(chainId, role.address))
    }
  })

  const multisigs = await Promise.all(requests)

  multisigs.forEach((multisig) => {
    accounts[multisig.address] = multisig
  })

  return roles.map((role) => {
    return { ...role.account, role: role.role, ...(accounts?.[role.address] || {}) }
  }) as (Account & { quorum?: number; signers?: string[] })[]
}
