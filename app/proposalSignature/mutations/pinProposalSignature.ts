import * as z from "zod"
import db from "db"
import pinJsonToPinata from "app/utils/pinata"
import updateProposalSignatureMetadata from "./updateProposalSignatureMetadata"

const PinProposalSignature = z.object({
  proposalSignatureId: z.string(),
  signature: z.string(),
  signatureMessage: z.any(),
})

// pins a signature to ipfs using pinata and updates the signature's metadata to have the ipfs metadata
export default async function pinProposalSignature(input: z.infer<typeof PinProposalSignature>) {
  const params = PinProposalSignature.parse(input)

  // find proposal signature by passed-in signature id
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

  // create the payload for ipfs
  // Pinata api here: https://docs.pinata.cloud/pinata-api/pinning/pin-json
  // see `pinJsonToIpfs` api for more details on api config structure
  const pinataProposalSignature = {
    pinataOptions: {
      cidVersion: 1, // more info on cid version:  https://docs.ipfs.tech/concepts/content-addressing/#cid-versions
    },
    // `pinataMetadata` is specific to pinata and not ipfs
    // it contains optional field that helps index the file
    pinataMetadata: {
      // `name` always exists on pinataMetadata
      name: proposalSignature?.id,
      // customizable fields that we (station) set are stored under pinata's `keyvalues` property
      keyvalues: {
        proposalId: proposalSignature?.proposal?.id,
        signerAddress: proposalSignature?.address,
      },
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
    // add ipfs response to proposal signature metadata
    const updatedProposalSignature = await updateProposalSignatureMetadata({
      proposalSignatureId: params.proposalSignatureId,
      signature: params.signature,
      message: proposalSignature?.message,
      representingRoles: proposalSignature?.representingRoles,
      proposalHash: proposalSignature?.proposal?.data?.proposalHash,
      ipfsHash: ipfsResponse.IpfsHash,
      ipfsPinSize: ipfsResponse.PinSize,
      ipfsTimestamp: ipfsResponse.Timestamp,
    })
    return updatedProposalSignature
  } catch (err) {
    throw Error(`Failure updating proposal Signature metadata: ${err}`)
  }
}
