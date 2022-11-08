import * as z from "zod"
import db from "db"
import { Rfp, RfpMetadata } from "../types"
import { ProposalTemplateFieldType, RESERVED_KEYS } from "app/template/types"
import { ProposalTemplateMetadata } from "app/template/types"

const UpdateRfpContent = z.object({
  rfpId: z.string(),
  title: z.string(),
  body: z.string(),
  bodyPrefill: z.string().optional(),
  oneLiner: z.string(),
})

export default async function updateRfpContent(input: z.infer<typeof UpdateRfpContent>) {
  const params = UpdateRfpContent.parse(input)
  try {
    // use $transaction to eliminate risk of race condition with changing other metadata
    // in edit form and waiting for new data to populate frontend state by just changing
    // token-gating metadata with fresh query on backend-side
    const rfp = await db.$transaction(async (db) => {
      const rfp = await db.rfp.findUnique({
        where: { id: params.rfpId },
        include: { template: true },
      })

      const oldTemplateFields = (rfp?.template?.data as ProposalTemplateMetadata)?.fields || []
      const oldBodyValidation = oldTemplateFields.find(
        (field) => field.key === RESERVED_KEYS.BODY
      )?.validation

      const templateMetadata = {
        title: params.title,
        fields: [
          ...oldTemplateFields.filter((field) => field.key !== RESERVED_KEYS.BODY),
          {
            key: RESERVED_KEYS.BODY,
            mapsTo: RESERVED_KEYS.BODY,
            ...(!!params.bodyPrefill
              ? {
                  fieldType: ProposalTemplateFieldType.PREFILL,
                  value: params.bodyPrefill,
                }
              : {
                  fieldType: ProposalTemplateFieldType.OPEN,
                }),
            validation: oldBodyValidation,
          },
        ],
      }

      const updatedTemplate = await db.proposalTemplate.update({
        where: { id: rfp?.templateId as string },
        data: {
          data: templateMetadata,
        },
      })

      const rfpMetadata = {
        ...Object(rfp?.data),
        content: {
          title: params.title,
          body: params.body,
          oneLiner: params.oneLiner,
        },
      } as RfpMetadata

      const updatedRfp = await db.rfp.update({
        where: { id: params.rfpId },
        data: {
          data: rfpMetadata,
        },
        include: {
          template: true,
        },
      })

      return updatedRfp
    })

    return rfp as Rfp
  } catch (err) {
    console.error("Failed to update RFP content", err)
    throw err
  }
}
