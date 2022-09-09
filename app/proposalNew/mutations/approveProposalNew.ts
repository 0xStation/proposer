import * as z from "zod"
import db from "db"
import pinJsonToPinata from "app/utils/pinata"
import updateProposalNew from "./updateProposalNew"

const ApproveProposalNew = z.object({
  proposalId: z.string(),
  signerAddress: z.string(),
  signature: z.string(),
})

export default async function approveProposalNew(input: z.infer<typeof ApproveProposalNew>) {
  const params = ApproveProposalNew.parse(input)

  try {
    // made upsert to avoid failures if frontend state management makes mistake and tries to submit signature twice
    await db.proposalSignature.upsert({
      where: {
        proposalId_address: {
          proposalId: params.proposalId,
          address: params.signerAddress,
        },
      },
      update: {
        data: {
          signature: params.signature,
        },
      },
      create: {
        proposalId: params.proposalId,
        address: params.signerAddress,
        data: {
          signature: params.signature,
        },
      },
    })
  } catch (err) {
    throw Error(`Failed to create signature in approveProposalNew: ${err}`)
  }

  // UPLOAD TO IPFS
  let proposal
  try {
    proposal = await db.proposalNew.findUnique({
      where: { id: params.proposalId },
      include: {
        roles: true,
        signatures: true,
      },
    })
  } catch (err) {
    throw Error(`Failed to find proposal in approveProposalNew: ${err}`)
  }
  // flattening proposal's data json object for the ipfs proposal
  let proposalCopy = JSON.parse(JSON.stringify(proposal.data))

  proposalCopy.type = proposal.type
  proposalCopy.timestamp = proposal.timestamp
  proposalCopy.roles = JSON.parse(JSON.stringify(proposal.roles))
  proposalCopy.payments = Object.assign({}, proposal.payments)
  proposalCopy.signatures = JSON.parse(JSON.stringify(proposal.signatures))

  // Pinata api here: https://docs.pinata.cloud/pinata-api/pinning/pin-json
  // see `pinJsonToIpfs` api for more details on api config structure
  const pinataProposal = {
    pinataOptions: {
      cidVersion: 1, // https://docs.ipfs.tech/concepts/content-addressing/#cid-versions
    },
    pinataMetadata: {
      name: proposal?.id, // optional field that helps tag the file
    },
    pinataContent: {
      proposal: proposalCopy,
    },
  }

  let ipfsResponse
  try {
    ipfsResponse = await pinJsonToPinata(pinataProposal)
  } catch (err) {
    throw Error(`Call to pinata failed with error: ${err}`)
  }

  try {
    // add ipfs response to proposal
    const paymentMetadata = proposal?.data?.payments?.[0] || {}
    const updatedProposal = await updateProposalNew({
      proposalId: params.proposalId,
      contentTitle: proposal?.data?.content?.title,
      contentBody: proposal?.data?.content?.body,
      contributorAddress: paymentMetadata.recipientAddress,
      token: paymentMetadata.token,
      paymentAmount: paymentMetadata.amount,
      ipfsHash: ipfsResponse.IpfsHash,
      ipfsPinSize: ipfsResponse.PinSize, // ipfs
      ipfsTimestamp: ipfsResponse.Timestamp,
    })
    return updatedProposal
  } catch (err) {
    throw Error(`Failure updating proposal: ${err}`)
  }
}
