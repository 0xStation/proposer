import db from "db"
import * as z from "zod"
import { ProposalTemplate } from "../types"

const GetTemplateById = z.object({
  id: z.string(),
})

export default async function getTemplateById(input: z.infer<typeof GetTemplateById>) {
  try {
    const params = GetTemplateById.parse(input)
    const template = await db.proposalTemplate.findFirst({
      where: {
        id: params.id,
      },
    })

    if (!template) {
      return null
    }
    return template as ProposalTemplate
  } catch (err) {
    console.error(`Failed to fetch proposal roles in "getTemplateById": ${err}`)
  }
}
