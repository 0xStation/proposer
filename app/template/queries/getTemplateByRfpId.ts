import db from "db"
import * as z from "zod"
import { ProposalTemplate } from "../types"

const GetTemplateByRfpId = z.object({
  rfpId: z.string(),
})

export default async function getTemplateByRfpId(input: z.infer<typeof GetTemplateByRfpId>) {
  try {
    const params = GetTemplateByRfpId.parse(input)
    const rfp = await db.rfp.findUnique({
      where: {
        id: params.rfpId,
      },
      include: {
        template: true,
      },
    })

    if (!rfp?.template) {
      return null
    }
    return rfp.template as ProposalTemplate
  } catch (err) {
    console.error(`Failed to fetch proposal roles in "getTemplateByRfpId": ${err}`)
  }
}
