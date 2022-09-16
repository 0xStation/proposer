import * as z from "zod"
import db from "db"
import pinJsonToPinata from "app/utils/pinata"
import updateProposalNewMetadata from "./updateProposalNewMetadata"
import { areApprovalsComplete } from "app/proposalNew/utils"
import { AddressType, ProposalNewApprovalStatus, ProposalNewStatus } from "@prisma/client"
import { ProposalNewApprovalType } from "app/proposalNewApproval/types"

const ApproveProposalNew = z.object({
  proposalId: z.string(),
  signerAddress: z.string(),
  message: z.any(),
  signature: z.string(),
  representing: z
    .object({
      address: z.string(),
      addressType: z.enum([AddressType.WALLET, AddressType.SAFE]),
      chainId: z.number().optional(),
    })
    .array(),
})

export default async function approveProposalNew(input: z.infer<typeof ApproveProposalNew>) {
  const params = ApproveProposalNew.parse(input)

  const connectOrCreates = params.representing.map((account) => {
    return {
      where: { proposalId_address: { proposalId: params.proposalId, address: account.address } },
      create: {
        proposalId: params.proposalId,
        address: account.address,
        status:
          account.addressType === AddressType.WALLET
            ? ProposalNewApprovalStatus.COMPLETE
            : ProposalNewApprovalStatus.INCOMPLETE,
        data: {
          message: params.message,
          signature: params.signature,
        },
      },
    }
  })

  try {
    await db.proposalSignature.create({
      data: {
        address: params.signerAddress,
        data: {
          message: params.message,
          signature: params.signature,
        },
        proposal: {
          connect: {
            id: params.proposalId,
          },
        },
        approvals: {
          connectOrCreate: connectOrCreates,
        },
      },
    })
  } catch (err) {
    throw Error(`Failed to create signature in approveProposalNew: ${err}`)
  }

  // for representing multisigs, query if signatures have hit quorum

  // UPLOAD TO IPFS
  let proposal
  try {
    proposal = await db.proposalNew.findUnique({
      where: { id: params.proposalId },
      include: {
        roles: true,
        payments: true,
        approvals: true,
        signatures: true,
      },
    })
  } catch (err) {
    throw Error(`Failed to find proposal in approveProposalNew: ${err}`)
  }

  // update proposal status based on status of signatures
  // if current status is the same as the pending status change
  // skip the update
  const approvalsComplete = areApprovalsComplete(proposal?.roles, proposal?.approvals)
  const pendingStatusChange = approvalsComplete
    ? ProposalNewStatus.APPROVED
    : ProposalNewStatus.AWAITING_APPROVAL

  if (proposal.status !== pendingStatusChange)
    await db.proposalNew.update({
      where: { id: params.proposalId },
      data: {
        status: pendingStatusChange,
      },
    })

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
    const updatedProposal = await updateProposalNewMetadata({
      proposalId: params.proposalId,
      contentTitle: proposal?.data?.content?.title,
      contentBody: proposal?.data?.content?.body,
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
