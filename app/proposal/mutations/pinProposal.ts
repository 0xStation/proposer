import * as z from "zod"
import db from "db"
import { Ctx } from "blitz"
import pinJsonToPinata from "app/utils/pinata"
import updateProposalMetadata from "./updateProposalMetadata"

const PinProposal = z.object({
  proposalId: z.string(),
})

// pins a proposal to ipfs using pinata and updates the signature's metadata to have the ipfs metadata
export default async function pinProposal(input: z.infer<typeof PinProposal>, ctx: Ctx) {
  const params = PinProposal.parse(input)

  // fnd proposal given the passed-in proposal id
  let proposal
  try {
    proposal = await db.proposal.findUnique({
      where: { id: params.proposalId },
      include: {
        roles: true,
        milestones: true,
        payments: true,
        signatures: true,
      },
    })
  } catch (err) {
    throw Error(`Failed to find proposal in pinProposal: ${err}`)
  }

  // create the pinata payload:
  // Pinata api specifications: https://docs.pinata.cloud/pinata-api/pinning/pin-json
  // see `pinJsonToIpfs` api for more details on api config structure
  const pinataProposal = {
    pinataOptions: {
      cidVersion: 1, // more info on version: https://docs.ipfs.tech/concepts/content-addressing/#cid-versions
    },
    // `pinataMetadata` is specific to pinata and not ipfs
    // it contains optional field that helps index the file
    pinataMetadata: {
      // `name` always exists on pinataMetadata
      name: proposal?.id,
      // customizable fields that we (station) set are stored under pinata's `keyvalues`
      keyvalues: {
        proposalId: proposal?.id,
      },
    },
    pinataContent: {
      address: ctx.session.siwe?.address,
      sig: proposal?.data?.authorSignature,
      data: {
        ...proposal?.data?.signatureMessage,
      },
    },
  }

  let ipfsResponse
  try {
    ipfsResponse = await pinJsonToPinata(pinataProposal)
  } catch (err) {
    throw Error(`Call to pinata failed with error: ${err}`)
  }

  try {
    let updatedProposal
    // add ipfs response to proposal's metadata
    updatedProposal = await updateProposalMetadata({
      proposalId: params.proposalId,
      contentTitle: proposal?.data?.content?.title,
      contentBody: proposal?.data?.content?.body,
      authorSignature: proposal?.data?.authorSignature,
      signatureMessage: proposal?.data?.signatureMessage,
      proposalHash: proposal?.data?.proposalHash,
      ipfsHash: ipfsResponse.IpfsHash,
      ipfsPinSize: ipfsResponse.PinSize,
      ipfsTimestamp: ipfsResponse.Timestamp,
      totalPayments: proposal?.data?.totalPayments,
      paymentTerms: proposal?.data?.paymentTerms,
    })

    return updatedProposal
  } catch (err) {
    throw Error(`Failure updating proposal: ${err}`)
  }
}
