import * as z from "zod"
import db from "db"
import pinJsonToPinata from "app/utils/pinata"
import updateProposalSignatureMetadata from "./updateProposalSignatureMetadata"

const PinProposalSignature = z.object({
  proposalSignatureId: z.string(),
  signature: z.string(),
  signatureMessage: z.any(),
})

export default async function pinProposalSignature(input: z.infer<typeof PinProposalSignature>) {
  const params = PinProposalSignature.parse(input)

  // UPLOAD TO IPFS
  let proposalSignature
  try {
    proposalSignature = await db.proposalSignature.findUnique({
      where: { id: params.proposalSignatureId },
      include: {
        proposal: true,
      },
    })
  } catch (err) {
    throw Error(`Failed to find proposal Signature in "pinProposalSignature": ${err}`)
  }

  // Pinata api here: https://docs.pinata.cloud/pinata-api/pinning/pin-json
  // see `pinJsonToIpfs` api for more details on api config structure
  const pinataProposalSignature = {
    pinataOptions: {
      cidVersion: 1, // https://docs.ipfs.tech/concepts/content-addressing/#cid-versions
    },
    pinataMetadata: {
      name: proposalSignature?.id, // optional field that helps tag the file
      proposalId: proposalSignature?.proposal?.id,
    },
    pinataContent: {
      address: proposalSignature?.address,
      sig: params.signature,
      data: {
        ...params.signatureMessage,
      },
    },
  }

  let ipfsResponse
  try {
    ipfsResponse = await pinJsonToPinata(pinataProposalSignature)
  } catch (err) {
    throw Error(`Call to pinata in "pinProposalSignature" failed with error: ${err}`)
  }

  try {
    // add ipfs response to proposal
    const updatedProposalSignature = await updateProposalSignatureMetadata({
      proposalSignatureId: params.proposalSignatureId,
      signature: params.signature,
      message: proposalSignature?.message,
      representingRoles: proposalSignature?.representingRoles,
      proposalHash: proposalSignature?.proposal?.data?.ipfsMetadata?.hash,
      ipfsHash: ipfsResponse.IpfsHash,
      ipfsPinSize: ipfsResponse.PinSize,
      ipfsTimestamp: ipfsResponse.Timestamp,
    })
    return updatedProposalSignature
  } catch (err) {
    throw Error(`Failure updating proposal Signature metadata: ${err}`)
  }
}
