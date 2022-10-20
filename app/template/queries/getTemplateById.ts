import db from "db"
import * as z from "zod"

const GetTemplateById = z.object({
  id: z.string(),
})

export default async function getTemplateById(input: z.infer<typeof GetTemplateById>) {
  try {
    const params = GetTemplateById.parse(input)
    const template = await db.template.findFirst({
      where: {
        id: params.id,
      },
    })

    if (!template) {
      return null
    }
    return template
  } catch (err) {
    console.error(`Failed to fetch proposal roles in "getProposalRolesById": ${err}`)
  }
}
