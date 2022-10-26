import { getGnosisSafeDetails } from "app/utils/getGnosisSafeDetails"
import db, { AddressType } from "db"
import * as z from "zod"
import { ProposalRoleWithSignatures } from "../types"

const GetRolesByProposalId = z.object({
  proposalId: z.string(),
})

export default async function getRolesByProposalId(input: z.infer<typeof GetRolesByProposalId>) {
  try {
    const params = GetRolesByProposalId.parse(input)
    const proposalRoles = (await db.proposalRole.findMany({
      where: {
        proposalId: params.proposalId,
      },
      include: {
        account: true,
        signatures: true,
      },
    })) as unknown as ProposalRoleWithSignatures[]

    if (!proposalRoles) {
      return []
    }

    let accountMetadatas = {}
    let gnosisRequests: any[] = []
    proposalRoles.forEach((role) => {
      accountMetadatas[role.address] = role.account?.data
      if (role.account?.addressType === AddressType.SAFE && role.account?.data.chainId)
        gnosisRequests.push(
          getGnosisSafeDetails(role.account?.data.chainId as number, role.address)
        )
    })

    const gnosisResults = await Promise.all(gnosisRequests)
    gnosisResults.forEach((results) => {
      if (!results) return
      const existingMetadata = accountMetadatas[results.address]
      accountMetadatas[results.address] = {
        ...existingMetadata,
        quorum: results.quorum,
        signers: results.signers,
      }
    })

    return proposalRoles.map((role) => {
      return {
        ...role,
        account: {
          ...role.account,
          data: accountMetadatas[role.address], // override with metadata threaded with quorum and signers
        },
      }
    }) as unknown as ProposalRoleWithSignatures[]
  } catch (err) {
    console.error(`Failed to fetch proposal roles in "getProposalRolesById": ${err}`)
  }
}
