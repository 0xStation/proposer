import db from "db"
import * as z from "zod"
import { ProposalTemplate } from "../types"

const GetTemplateByRfpId = z.object({
  rfpId: z.string(),
})

export default async function getTemplateByRfpId(input: z.infer<typeof GetTemplateByRfpId>) {
  try {
    const params = GetTemplateByRfpId.parse(input)
    const template = await db.proposalTemplate.findFirst({
      where: {
        rfps: {
          some: {
            id: {
              equals: params.rfpId,
            },
          },
        },
      },
    })

    if (!template) {
      return null
    }
    return template as ProposalTemplate
  } catch (err) {
    console.error(`Failed to fetch proposal roles in "getTemplateByRfpId": ${err}`)
  }
}
