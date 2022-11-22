import * as z from "zod"
import db, { ProposalRoleType, RfpStatus } from "db"
import { ZodToken } from "app/types/zod"
import { Rfp, SocialConnection } from "app/rfp/types"
import { PaymentTerm } from "app/proposalPayment/types"

const CreateRfp = z.object({
  requesterAddress: z.string(),
  requesterRole: z.enum([ProposalRoleType.CLIENT, ProposalRoleType.CONTRIBUTOR]),
  proposerRole: z.enum([ProposalRoleType.CLIENT, ProposalRoleType.CONTRIBUTOR]),
  title: z.string(),
  body: z.string().optional().default(""),
  status: z.enum([RfpStatus.OPEN, RfpStatus.CLOSED, RfpStatus.TIME_DEPENDENT]),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  payment: z.object({
    token: ZodToken.optional(),
    minAmount: z.number().optional(),
    maxAmount: z.number().optional(),
    terms: z
      .enum([PaymentTerm.ON_AGREEMENT, PaymentTerm.AFTER_COMPLETION, PaymentTerm.ADVANCE_PAYMENT])
      .optional(),
    advancePaymentPercentage: z.number().optional(),
  }),
  bodyPrefill: z.string().optional(),
  minWordCount: z.number().optional(),
  singleTokenGate: z
    .object({
      token: ZodToken,
      minBalance: z.string(),
    })
    .optional(),
  requiredSocialConnections: z
    .enum([
      SocialConnection.DISCORD,
      SocialConnection.TWITTER,
      SocialConnection.GITHUB,
      SocialConnection.FARCASTER,
      SocialConnection.LENS,
    ])
    .array(),
})

export default async function createRfp(input: z.infer<typeof CreateRfp>) {
  try {
    const params = CreateRfp.parse(input)

    const rfpMetadata = {
      content: {
        title: params.title,
        body: params.body,
        oneLiner: "",
      },
      singleTokenGate: params.singleTokenGate,
      requiredSocialConnections: params.requiredSocialConnections,
      proposal: {
        requesterRole: params.requesterRole,
        proposerRole: params.proposerRole,
        body: {
          prefill: params.bodyPrefill,
          minWordCount: params.minWordCount,
        },
        payment: params.payment,
      },
    }

    const rfp = await db.rfp.create({
      data: {
        accountAddress: params.requesterAddress,
        status: params.status,
        startDate: params.startDate,
        endDate: params.endDate,
        data: rfpMetadata,
      },
    })

    return rfp as Rfp
  } catch (err) {
    console.error(`Failed to create rfp: ${err}`)
  }
}
