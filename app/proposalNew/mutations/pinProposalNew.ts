import * as z from "zod"
import db, { ProposalNewStatus } from "db"
import { Ctx } from "blitz"
import pinJsonToPinata from "app/utils/pinata"
import updateProposalNewMetadata from "./updateProposalNewMetadata"

const PinProposalNew = z.object({
  proposalId: z.string(),
  signature: z.string(),
  signatureMessage: z.any(),
})

// pins a proposal to ipfs using pinata and updates the signature's metadata to have the ipfs metadata
export default async function pinProposalNew(input: z.infer<typeof PinProposalNew>, ctx: Ctx) {
  const params = PinProposalNew.parse(input)

  // fnd proposal given the passed-in proposal id
  let proposal
  try {
    proposal = await db.proposalNew.findUnique({
      where: { id: params.proposalId },
      include: {
        roles: true,
        milestones: true,
        payments: true,
        signatures: true,
      },
    })
  } catch (err) {
    throw Error(`Failed to find proposal in pinProposalNew: ${err}`)
  }

  // flattening proposal's data json object for the ipfs proposal
  let proposalCopy = JSON.parse(JSON.stringify(proposal.data))

  proposalCopy.type = proposal.type
  proposalCopy.timestamp = proposal.timestamp
  proposalCopy.roles = JSON.parse(JSON.stringify(proposal.roles))
  proposalCopy.payments = Object.assign({}, proposal.payments)

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
      name: proposal?.id,
    },
    pinataContent: {
      address: ctx.session.siwe?.address,
      sig: params.signature,
      data: {
        ...params.signatureMessage,
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
    updatedProposal = await updateProposalNewMetadata({
      proposalId: params.proposalId,
      contentTitle: proposal?.data?.content?.title,
      contentBody: proposal?.data?.content?.body,
      ipfsHash: ipfsResponse.IpfsHash,
      ipfsPinSize: ipfsResponse.PinSize,
      ipfsTimestamp: ipfsResponse.Timestamp,
      totalPayments: proposal?.data?.totalPayments,
      paymentTerms: proposal?.data?.paymentTerms,
    })

    if (updatedProposal && updatedProposal.status === ProposalNewStatus.DRAFT) {
      updatedProposal = await db.proposalNew.update({
        where: {
          id: params.proposalId,
        },
        data: {
          status: ProposalNewStatus.AWAITING_APPROVAL,
        },
      })
    }
    return updatedProposal
  } catch (err) {
    throw Error(`Failure updating proposal: ${err}`)
  }
}
