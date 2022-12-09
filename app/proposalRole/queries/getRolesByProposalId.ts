import { Proposal } from "app/proposal/types"
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
    const [proposal, proposalRoles] = (await db.$transaction([
      db.proposal.findUnique({
        where: { id: params.proposalId },
      }),
      db.proposalRole.findMany({
        where: {
          proposalId: params.proposalId,
        },
        include: {
          account: true,
          signatures: true,
        },
      }),
    ])) as unknown as [Proposal, ProposalRoleWithSignatures[]]

    if (!proposalRoles) {
      return []
    }

    // account metadata accumulator to insert safe details into
    let accountMetadatas = {}
    // make requests to gnosis for each role that is a SAFE
    let gnosisRequests: any[] = []
    proposalRoles.forEach((role) => {
      accountMetadatas[role.address] = role.account?.data
      if (role.account?.addressType === AddressType.SAFE && role.account?.data.chainId)
        gnosisRequests.push(
          getGnosisSafeDetails(role.account?.data.chainId as number, role.address)
        )
    })
    // batch await gnosis requests and add safe details to each account metadata accumulator
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
    // combine fetched quorum and signers into returned role entities
    return proposalRoles.map((role) => {
      return {
        ...role,
        account: {
          ...role.account,
          data: accountMetadatas[role.address], // override with metadata threaded with quorum and signers
        },
        signatures: role.signatures.filter(
          (signature) => signature.proposalVersion === proposal.version
        ),
      }
    }) as unknown as ProposalRoleWithSignatures[]
  } catch (err) {
    console.error(`Failed to fetch proposal roles in "getProposalRolesById": ${err}`)
  }
}
