import db from "db"
import * as z from "zod"
import { Rfp } from "../types"

const GetRfpByTemplateId = z.object({
  templateId: z.string(),
})

export default async function getRfpsByTemplateId(input: z.infer<typeof GetRfpByTemplateId>) {
  try {
    const params = GetRfpByTemplateId.parse(input)
    const rfp = await db.rfp.findMany({
      where: {
        template: {
          id: {
            equals: params.templateId,
          },
        },
      },
    })

    if (!rfp) {
      return null
    }

    return rfp as unknown as Rfp
  } catch (err) {
    console.error("Error in getRfpByTemplateId", err)
  }
}
