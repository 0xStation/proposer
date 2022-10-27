import { PaymentTerm } from "app/proposalPayment/types"
import { ZodToken } from "app/types/zod"
import db, { ProposalRoleType } from "db"
import * as z from "zod"
import { ProposalTemplate, ProposalTemplateFieldType, RESERVED_KEYS } from "../types"

const CreateTemplate = z.object({
  title: z.string(),
  linkedAccountAddress: z.string(),
  defaultClientAddress: z.string(),
  payment: z
    .object({
      token: ZodToken,
      amount: z.number(),
      terms: z.enum([
        PaymentTerm.ON_AGREEMENT,
        PaymentTerm.AFTER_COMPLETION,
        PaymentTerm.ADVANCE_PAYMENT,
      ]),
    })
    .optional(),
})

export default async function createTemplate(input: z.infer<typeof CreateTemplate>) {
  try {
    const params = CreateTemplate.parse(input)

    const templateMetadata = {
      title: params.title,
      fields: [
        {
          key: RESERVED_KEYS.CONTRIBUTORS,
          mapsTo: RESERVED_KEYS.ROLES,
          value: [],
          fieldType: ProposalTemplateFieldType.OPEN,
        },
        {
          key: RESERVED_KEYS.AUTHORS,
          mapsTo: RESERVED_KEYS.ROLES,
          value: [],
          fieldType: ProposalTemplateFieldType.OPEN,
        },
        {
          key: RESERVED_KEYS.CLIENTS,
          mapsTo: RESERVED_KEYS.ROLES,
          value: [{ address: params.defaultClientAddress, type: ProposalRoleType.CLIENT }],
          fieldType: ProposalTemplateFieldType.PRESELECT,
        },
        {
          key: RESERVED_KEYS.MILESTONES,
          mapsTo: RESERVED_KEYS.MILESTONES,
          value: [],
          fieldType: ProposalTemplateFieldType.PRESELECT,
        },
        {
          key: RESERVED_KEYS.PAYMENTS,
          mapsTo: RESERVED_KEYS.PAYMENTS,
          value: [],
          fieldType: ProposalTemplateFieldType.PRESELECT,
        },
        {
          key: RESERVED_KEYS.PAYMENT_TERMS,
          mapsTo: RESERVED_KEYS.PAYMENT_TERMS,
          value: undefined,
          fieldType: ProposalTemplateFieldType.PRESELECT,
        },
      ],
    }

    // const template = await db.proposalTemplate.findUnique({
    //   where: {
    //     id: params.id,
    //   },
    // })

    // if (!template) {
    //   return null
    // }
    // return template as ProposalTemplate
  } catch (err) {
    console.error(`Failed to create template: ${err}`)
  }
}
