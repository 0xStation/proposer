import db from "db"
import * as z from "zod"
import { ProposalSignatureMetadata } from "../types"

const UpdateProposalSignatureMetadata = z.object({
  proposalSignatureId: z.string(),
  message: z.any(),
  representingRoles: z.any(),
  signature: z.string(),
  proposalHash: z.string(),
  ipfsHash: z.string().optional(),
  ipfsPinSize: z.number().optional(),
  ipfsTimestamp: z.string().optional(),
})

// Updates the json metadata of a signature
// This function currently serves the purpose of adding
// decentralized storage to the metadata.
export default async function updateProposalSignatureMetadata(
  input: z.infer<typeof UpdateProposalSignatureMetadata>
) {
  const params = UpdateProposalSignatureMetadata.parse(input)

  const { ipfsHash, ipfsPinSize, ipfsTimestamp } = params
  const proposalSignatureMetadata = {
    message: params?.message,
    signature: params?.signature,
    representingRoles: params?.representingRoles,
    proposalHash: params?.proposalHash,
    ipfsMetadata: {
      hash: ipfsHash,
      ipfsPinSize,
      timestamp: ipfsTimestamp,
    },
  } as unknown as ProposalSignatureMetadata

  try {
    const proposalSignature = await db.proposalSignature.update({
      where: { id: params.proposalSignatureId },
      data: {
        data: JSON.parse(JSON.stringify(proposalSignatureMetadata)),
      },
    })
    return proposalSignature
  } catch (err) {
    throw Error(`Error updating proposal, failed with error: ${err.message}`)
  }
}
