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
    await db.proposalSignature.create({
      data: {
        proposalId: params.proposalId,
        address: params.signerAddress,
        data: {
          signature: params.signature,
        },
      },
    })
  } catch (err) {
    throw Error(`Failed to create signature in approveProposalNew: ${JSON.parse(err)}`)
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
    throw Error(`Failed to find proposal in approveProposalNew: ${JSON.parse(err)}`)
  }
  // flattening proposal's data json object for the ipfs proposal
  let proposalCopy = JSON.parse(JSON.stringify(proposal.data))

  proposalCopy.type = proposal.type
  proposalCopy.timestamp = proposal.timestamp
  proposalCopy.roles = JSON.parse(JSON.stringify(proposal.roles))
  proposalCopy.payments = [] // TODO: payments doesn't exist yet, so we're leaving an empty array here
  proposalCopy.signatures = JSON.parse(JSON.stringify(proposal.signatures))

  const pinataProposal = {
    pinataOptions: {
      cidVersion: 1,
    },
    pinataMetadata: {
      name: proposal?.id,
    },
    pinataContent: proposalCopy,
  }

  let ipfsResponse
  try {
    ipfsResponse = await pinJsonToPinata(pinataProposal)
  } catch (err) {
    throw Error(`Call to pinata failed with error: ${JSON.parse(err)}`)
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
      pinSize: ipfsResponse.PinSize, // ipfs
      ipfsTimestamp: ipfsResponse.Timestamp,
    })
    return updatedProposal
  } catch (err) {
    throw Error(`Failure updating proposal: ${JSON.parse(err)}`)
  }
}
