import * as z from "zod"
import db, { ProposalRoleType } from "db"
import { ZodToken } from "app/types/zod"
import { Rfp, SocialConnection } from "app/rfp/types"
import { PaymentTerm } from "app/proposalPayment/types"

const CreateRfp = z.object({
  title: z.string(),
  body: z.string().optional().default(""),
  requesterAddress: z.string(),
  requesterRole: z.enum([ProposalRoleType.CLIENT, ProposalRoleType.CONTRIBUTOR]),
  proposerRole: z.enum([ProposalRoleType.CLIENT, ProposalRoleType.CONTRIBUTOR]),
  payment: z.object({
    token: ZodToken,
    amount: z.number(),
    terms: z.enum([
      PaymentTerm.ON_AGREEMENT,
      PaymentTerm.AFTER_COMPLETION,
      PaymentTerm.ADVANCE_PAYMENT,
    ]),
    advancePaymentPercentage: z.number().optional(),
  }),
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
  minWordCount: z.number().optional(),
  bodyPrefill: z.string().optional(),
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
        data: rfpMetadata,
      },
    })

    return rfp as Rfp
  } catch (err) {
    console.error(`Failed to create rfp: ${err}`)
  }
}
