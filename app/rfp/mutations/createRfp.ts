import * as z from "zod"
import db, { ProposalRoleType } from "db"
import { ZodToken } from "app/types/zod"
import { Rfp } from "app/rfp/types"
import { ProposalTemplateFieldType, RESERVED_KEYS } from "app/template/types"
import { PaymentTerm } from "app/proposalPayment/types"

const CreateRfp = z.object({
  title: z.string(),
  submissionGuidelines: z.string(),
  associatedAccountAddress: z.string(),
  preselectClientAddress: z.string().optional(),
  preselectContributorAddress: z.string().optional(),
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
})

export default async function createRfp(input: z.infer<typeof CreateRfp>) {
  try {
    const params = CreateRfp.parse(input)

    const templateMetadata = {
      title: params.title,
      fields: [
        {
          key: RESERVED_KEYS.CONTRIBUTORS,
          mapsTo: RESERVED_KEYS.ROLES,
          ...(params.preselectContributorAddress
            ? {
                fieldType: ProposalTemplateFieldType.PRESELECT,
                value: [
                  { address: params.preselectContributorAddress, type: ProposalRoleType.CLIENT },
                ],
              }
            : {
                fieldType: ProposalTemplateFieldType.OPEN,
                value: [],
              }),
        },
        {
          key: RESERVED_KEYS.CLIENTS,
          mapsTo: RESERVED_KEYS.ROLES,
          ...(params.preselectClientAddress
            ? {
                fieldType: ProposalTemplateFieldType.PRESELECT,
                value: [{ address: params.preselectClientAddress, type: ProposalRoleType.CLIENT }],
              }
            : {
                fieldType: ProposalTemplateFieldType.OPEN,
                value: [],
              }),
        },
        {
          key: RESERVED_KEYS.MILESTONES,
          mapsTo: RESERVED_KEYS.MILESTONES,
          fieldType: ProposalTemplateFieldType.PRESELECT,
          value: [
            ...(params.payment.terms === PaymentTerm.ON_AGREEMENT
              ? [
                  {
                    title: "Upfront payment",
                    index: 0,
                  },
                ]
              : params.payment.terms === PaymentTerm.AFTER_COMPLETION
              ? [
                  {
                    title: "Completion payment",
                    index: 0,
                  },
                ]
              : // else terms are ADVANCE_PAYMENT
                [
                  {
                    title: "Advance payment",
                    index: 0,
                  },
                  {
                    title: "Completion payment",
                    index: 1,
                  },
                ]),
          ],
        },
        {
          key: RESERVED_KEYS.PAYMENTS,
          mapsTo: RESERVED_KEYS.PAYMENTS,
          fieldType: ProposalTemplateFieldType.PRESELECT,
          value: [
            ...(params.payment.terms === PaymentTerm.ON_AGREEMENT
              ? [
                  {
                    milestoneIndex: 0,
                    senderAddress: params.preselectClientAddress,
                    recipientAddress: params.preselectContributorAddress,
                    token: params.payment.token,
                    amount: params.payment.amount,
                  },
                ]
              : params.payment.terms === PaymentTerm.AFTER_COMPLETION
              ? [
                  {
                    milestoneIndex: 0,
                    senderAddress: params.preselectClientAddress,
                    recipientAddress: params.preselectContributorAddress,
                    token: params.payment.token,
                    amount: params.payment.amount,
                  },
                ]
              : [
                  {
                    milestoneIndex: 0,
                    senderAddress: params.preselectClientAddress,
                    recipientAddress: params.preselectContributorAddress,
                    token: params.payment.token,
                    amount:
                      (params.payment.amount * (params.payment.advancePaymentPercentage || 100)) /
                      100,
                  },
                  {
                    milestoneIndex: 1,
                    senderAddress: params.preselectClientAddress,
                    recipientAddress: params.preselectContributorAddress,
                    token: params.payment.token,
                    amount:
                      params.payment.amount -
                      (params.payment.amount * (params.payment.advancePaymentPercentage || 100)) /
                        100,
                  },
                ]),
          ],
        },
        {
          key: RESERVED_KEYS.PAYMENT_TERMS,
          mapsTo: RESERVED_KEYS.PAYMENT_TERMS,
          fieldType: ProposalTemplateFieldType.PRESELECT,
          value: params.payment.terms,
        },
      ],
    }

    const rfpMetadata = {
      content: {
        title: params.title,
        body: "",
        oneLiner: "",
        submissionGuidelines: params.submissionGuidelines,
      },
      singleTokenGate: params.singleTokenGate,
    }

    const rfp = await db.rfp.create({
      data: {
        account: {
          connect: {
            address: params.associatedAccountAddress,
          },
        },
        data: rfpMetadata,
        template: {
          create: {
            data: templateMetadata,
            account: {
              connect: {
                address: params.associatedAccountAddress,
              },
            },
          },
        },
      },
    })

    return rfp as Rfp
  } catch (err) {
    console.error(`Failed to create rfp: ${err}`)
  }
}
