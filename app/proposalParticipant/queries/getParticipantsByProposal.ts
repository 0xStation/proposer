import { getGnosisSafeDetails } from "app/utils/getGnosisSafeDetails"
import db, { AddressType } from "db"
import * as z from "zod"
import { ProposalParticipant } from "../types"

const GetParticipantsByProposal = z.object({
  proposalId: z.string(),
})

export default async function getParticipantsByProposal(
  input: z.infer<typeof GetParticipantsByProposal>
) {
  try {
    const params = GetParticipantsByProposal.parse(input)
    const proposalParticipants = (await db.proposalParticipant.findMany({
      where: {
        proposalId: params.proposalId,
      },
      include: {
        account: true,
        signatures: true,
      },
    })) as unknown as ProposalParticipant[]

    if (!proposalParticipants) {
      return []
    }

    // account metadata accumulator to insert safe details into
    let accountMetadatas = {}
    // make requests to gnosis for each role that is a SAFE
    let gnosisRequests: any[] = []
    proposalParticipants.forEach((role) => {
      accountMetadatas[role.accountAddress] = role.account?.data
      if (role.account?.addressType === AddressType.SAFE && role.account?.data.chainId)
        gnosisRequests.push(
          getGnosisSafeDetails(role.account?.data.chainId as number, role.accountAddress)
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
    return proposalParticipants.map((role) => {
      return {
        ...role,
        account: {
          ...role.account,
          data: accountMetadatas[role.accountAddress], // override with metadata threaded with quorum and signers
        },
      }
    }) as unknown as ProposalParticipant[]
  } catch (err) {
    console.error(`Failed to fetch proposal participants in "getProposalParticipantsById": ${err}`)
  }
}
