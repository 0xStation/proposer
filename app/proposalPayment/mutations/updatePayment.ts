import db, { ProposalMilestone, ProposalRoleApprovalStatus, ProposalStatus } from "db"
import * as z from "zod"
import { Ctx } from "blitz"
import { getHash } from "app/signatures/utils"
import { ZodToken } from "app/types/zod"
import { PaymentTerm, ProposalPayment } from "../types"
import { Proposal, ProposalMetadata } from "app/proposal/types"
import { MILESTONE_COPY, PAYMENT_TERMS_TO_MILESTONE_COPY } from "app/core/utils/constants"
import { Token } from "app/token/types"
import { genProposalDigest } from "app/signatures/proposal"

const UpdatePayment = z.object({
  proposalId: z.string(),
  token: ZodToken,
  amount: z.string(),
  paymentTerms: z.enum([
    PaymentTerm.ON_AGREEMENT,
    PaymentTerm.AFTER_COMPLETION,
    PaymentTerm.ADVANCE_PAYMENT,
  ]),
  advancePaymentPercentage: z.string().optional(),
  proposalVersionAnnotation: z.string().optional(),
})

export default async function updatePayment(input: z.infer<typeof UpdatePayment>, ctx: Ctx) {
  const params = UpdatePayment.parse(input)

  // TODO: better auth
  ctx.session.$authorize([], [])

  const existingProposal = await db.proposal.findUnique({
    where: {
      id: params.proposalId,
    },
    include: { roles: true, milestones: true, payments: true },
  })

  if (
    !existingProposal ||
    (existingProposal.status !== ProposalStatus.DRAFT &&
      existingProposal.status !== ProposalStatus.AWAITING_APPROVAL)
  ) {
    throw Error("Proposal cannot be edited if it has already been approved")
  }

  const milestones = await db.proposalMilestone.findMany({
    where: { proposalId: params.proposalId },
    include: { payments: true },
  })

  // if neither are advancedPayment assume there's one milestone
  if (
    (existingProposal.data as ProposalMetadata).paymentTerms !== PaymentTerm.ADVANCE_PAYMENT &&
    params.paymentTerms !== PaymentTerm.ADVANCE_PAYMENT
  ) {
    await db.proposalMilestone.update({
      where: {
        id: milestones?.[0]?.id as string,
      },
      data: {
        data: {
          title: MILESTONE_COPY[PAYMENT_TERMS_TO_MILESTONE_COPY[params.paymentTerms]],
        },
      },
    })

    await db.proposalPayment.update({
      where: { id: milestones?.[0]?.payments?.[0]?.id as string },
      data: {
        amount: parseFloat(params?.amount),
        data: {
          token: params.token as Token,
          ...((milestones?.[0]?.payments?.[0] as ProposalPayment)?.data as {}),
        },
      },
    })
  } else if (
    // assume we update 2 existing milestones & payments
    // or update 1 milestone and payment and create a new milestone/payment
    params.paymentTerms === PaymentTerm.ADVANCE_PAYMENT &&
    params.advancePaymentPercentage
  ) {
    const advancedPayment =
      (parseFloat(params?.amount) * parseFloat(params.advancePaymentPercentage as string)) / 100
    const completionPayment = parseFloat(params?.amount) - advancedPayment

    const upsertMilestones = Array.from(Array(2)).map(async (val, idx) => {
      return await db.proposalMilestone.upsert({
        where: {
          proposalId_index: {
            proposalId: existingProposal?.id,
            index: idx,
          },
        },
        create: {
          index: idx,
          proposalId: existingProposal?.id,
          data: {
            title:
              idx === 0
                ? MILESTONE_COPY[PAYMENT_TERMS_TO_MILESTONE_COPY[PaymentTerm.ADVANCE_PAYMENT]]
                : MILESTONE_COPY[PAYMENT_TERMS_TO_MILESTONE_COPY[PaymentTerm.AFTER_COMPLETION]],
          },
        },
        update: {
          data: {
            title:
              idx === 0
                ? MILESTONE_COPY[PAYMENT_TERMS_TO_MILESTONE_COPY[PaymentTerm.ADVANCE_PAYMENT]]
                : MILESTONE_COPY[PAYMENT_TERMS_TO_MILESTONE_COPY[PaymentTerm.AFTER_COMPLETION]],
          },
        },
      })
    })
    const updatedMilestones = await Promise.all(upsertMilestones)
    if (milestones.length < 2) {
      // update the first milestone
      await db.proposalPayment.update({
        where: {
          id: milestones?.[0]?.payments?.[0]?.id,
        },
        data: {
          amount: advancedPayment,
          data: {
            token: params.token as Token,
            history: [],
          },
        },
      })
      // create the second milestone
      ;(await db.proposalPayment.create({
        data: {
          proposalId: existingProposal?.id,
          milestoneId: updatedMilestones[1]?.id as string,
          senderAddress: milestones?.[0]?.payments?.[0]?.senderAddress as string,
          recipientAddress: milestones?.[0]?.payments?.[0]?.recipientAddress as string,
          amount: completionPayment,
          data: {
            token: params.token as Token,
            history: [],
          },
        },
      })) as ProposalPayment
    } else {
      milestones.forEach(async (milestone, idx) => {
        const payment = idx === 0 ? advancedPayment : completionPayment

        await db.proposalPayment.upsert({
          where: {
            id: milestone.id,
          },
          create: {
            proposalId: existingProposal?.id,
            milestoneId: milestone.id,
            senderAddress: milestones?.[0]?.payments?.[0]?.senderAddress as string,
            recipientAddress: milestones?.[0]?.payments?.[0]?.recipientAddress as string,
            amount: payment,
            data: {
              token: params.token,
              history: [],
            },
          },
          update: {
            amount: payment,
            data: {
              token: params.token as Token,
              history: [],
            },
          },
        })
      })
    }
  } else if (
    params.paymentTerms !== PaymentTerm.ADVANCE_PAYMENT &&
    (existingProposal.data as ProposalMetadata).paymentTerms === PaymentTerm.ADVANCE_PAYMENT
  ) {
    const paymentToDeleteId = milestones?.[1]?.payments?.[0]?.id
    const milestoneToDeleteId = milestones?.[1]?.id
    // need to update and delete milestone and payment for the existing terms
    await db.proposalMilestone.update({
      where: {
        id: milestones?.[0]?.id as string,
      },
      data: {
        data: {
          title: MILESTONE_COPY[PAYMENT_TERMS_TO_MILESTONE_COPY[params.paymentTerms]],
        },
      },
    })

    await db.proposalPayment.update({
      where: {
        id: milestones?.[0]?.payments?.[0]?.id,
      },
      data: {
        amount: parseFloat(params.amount),
        data: {
          token: params.token as Token,
          history: [],
        },
      },
    })
    await db.proposalPayment.delete({
      // onDelete: Cascade the proposalPayment
      where: { id: paymentToDeleteId as string },
    })

    await db.proposalMilestone.delete({
      // onDelete: Cascade the proposalPayment
      where: { id: milestoneToDeleteId },
    })
  }

  const updatedProposalVersion = existingProposal?.version + 1
  const updatedProposal = await db.proposal.update({
    where: {
      id: params.proposalId,
    },
    data: {
      version: updatedProposalVersion,
      data: {
        ...(existingProposal?.data as ProposalMetadata),
        advancePaymentPercentage: params.advancePaymentPercentage,
        paymentTerms: params.paymentTerms,
        totalPayments: [{ amount: parseFloat(params?.amount), token: params.token }],
      },
    },
    include: {
      roles: true,
      milestones: true,
      payments: true,
    },
  })

  const message = genProposalDigest(updatedProposal as Proposal)
  const { domain, types, value } = message
  const proposalHash = getHash(domain, types, value)

  await db.proposalVersion.create({
    data: {
      proposalId: existingProposal?.id,
      version: updatedProposalVersion,
      editorAddress: ctx?.session?.siwe?.address as string,
      data: {
        content: {
          title: `Version ${updatedProposalVersion}`,
          body: params.proposalVersionAnnotation,
        },
        proposalSignatureMessage: message,
        proposalHash: proposalHash,
        changes: {
          payments: [
            {
              before: {
                recipientAddress: milestones?.[0]?.payments?.[0]?.recipientAddress,
                senderAddress: milestones?.[0]?.payments?.[0]?.senderAddress,
                amount: (existingProposal?.data as ProposalMetadata)?.totalPayments?.[0]?.amount,
                token: (existingProposal?.data as ProposalMetadata)?.totalPayments?.[0]?.token,
                paymentTerms: (existingProposal.data as ProposalMetadata).paymentTerms,
                advancePaymentPercentage: (existingProposal.data as ProposalMetadata)
                  .advancePaymentPercentage,
              },
              after: {
                recipientAddress: milestones?.[0]?.payments?.[0]?.recipientAddress,
                senderAddress: milestones?.[0]?.payments?.[0]?.senderAddress,
                amount: params.amount,
                token: params.token,
                paymentTerms: params.paymentTerms,
                advancePaymentPercentage: params.advancePaymentPercentage,
              },
            },
          ],
        },
      },
    },
  })

  await db.proposalRole.updateMany({
    where: {
      proposalId: updatedProposal?.id as string,
      approvalStatus: ProposalRoleApprovalStatus.APPROVED,
    },
    data: {
      approvalStatus: ProposalRoleApprovalStatus.PENDING,
    },
  })
}
