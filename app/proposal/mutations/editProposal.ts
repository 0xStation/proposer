import { Ctx } from "blitz"
import db, { ProposalRoleApprovalStatus, ProposalStatus, ProposalVersion } from "db"
import * as z from "zod"
import { PaymentTerm } from "app/proposalPayment/types"
import { ZodToken } from "app/types/zod"
import { Proposal, ProposalMetadata } from "../types"

const EditProposal = z.object({
  proposalId: z.string(),
  updatedVersion: z.number(),
  contentTitle: z.string(),
  contentBody: z.string(),
  signature: z.string(), // signature of editor (author)
  signatureMessage: z.any(), //should be optional in draft form
  proposalHash: z.string(), // should be optional in draft form
  totalPayments: z.object({ token: ZodToken, amount: z.number() }).array().optional(),
  paymentTerms: z
    .enum([PaymentTerm.ON_AGREEMENT, PaymentTerm.AFTER_COMPLETION, PaymentTerm.ADVANCE_PAYMENT])
    .optional(),
  advancePaymentPercentage: z.number().optional(),
  proposalVersionAnnotation: z.string().optional(),
})

// `editProposal`'s use case is to update a proposal's title and body
// and create a new proposalVersion instance within the same transaction call.

// This function is to be called after
// the proposal has been sent to all parties and
// before proposal approval.
export default async function editProposal(input: z.infer<typeof EditProposal>, ctx: Ctx) {
  const params = EditProposal.parse(input)

  if (!ctx?.session?.siwe?.address) {
    throw Error("Could not find siwe address. User is unauthorized to edit proposal")
  }

  let proposal
  try {
    proposal = await db.proposal.findUnique({
      where: { id: params.proposalId },
    })
  } catch (err) {
    console.error("Failed to fetch proposal in editProposal", err)
    throw Error("Failed to fetch existing proposal")
  }

  if (!proposal) {
    throw Error("Proposal does not exist")
  }

  if ((proposal as Proposal)?.status !== ProposalStatus?.AWAITING_APPROVAL) {
    throw Error(`Editing is not allowed unless proposal is awaiting approval.`)
  }

  const proposalMetadata = {
    content: {
      title: params.contentTitle,
      body: params.contentBody,
    },
    ipfsMetadata: JSON.parse(JSON.stringify(proposal?.data?.ipfsMetadata)), // ipfs data doesn't exist yet, until after a proposal is approved
    proposalHash: params.proposalHash,
    authorSignature: params.signature,
    signatureMessage: params.signatureMessage,
    totalPayments: params.totalPayments,
    paymentTerms: params.paymentTerms,
    advancePaymentPercentage: params.advancePaymentPercentage,
  } as unknown as ProposalMetadata

  try {
    const [updatedProposal, newProposalVersion] = await db.$transaction([
      db.proposal.update({
        where: { id: params.proposalId },
        data: {
          version: params?.updatedVersion,
          data: proposalMetadata,
        },
        include: {
          roles: true,
          milestones: true,
          payments: true,
          signatures: true,
        },
      }),
      // opting for create rather than upsert so that we throw if for some reason
      // the proposalVersion with the id already exists.
      db.proposalVersion.create({
        data: {
          proposalId: proposal?.id,
          version: params?.updatedVersion,
          editorAddress: ctx?.session?.siwe?.address as string,
          data: {
            content: {
              title: `Version ${params?.updatedVersion}`,
              body: params.proposalVersionAnnotation,
            },
            proposalSignatureMessage: params.signatureMessage,
            proposalHash: params.proposalHash,
          },
        },
      }),
      db.proposalRole.updateMany({
        where: {
          proposalId: proposal?.id as string,
          approvalStatus: ProposalRoleApprovalStatus.APPROVED,
        },
        data: {
          approvalStatus: ProposalRoleApprovalStatus.PENDING,
        },
      }),
    ])

    return { updatedProposal, newProposalVersion } as {
      updatedProposal: Proposal
      newProposalVersion: ProposalVersion
    }
  } catch (err) {
    throw Error(`Error updating proposal, failed with error: ${err.message}`)
  }
}
