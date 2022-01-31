import db from "db"
import * as z from "zod"

const CreateApplication = z.object({
  url: z.string(),
  entryDescription: z.string(),
  applicantId: z.number(),
  initiativeId: z.number(),
})

export default async function createApplication(input: z.infer<typeof CreateApplication>) {
  const params = CreateApplication.parse(input)

  const payload = {
    data: {
      approved: false,
      url: params.url,
      entryDescription: params.entryDescription,
    },
    applicant: { connect: { id: params.applicantId } },
    initiative: { connect: { id: params.initiativeId } },
  }

  const application = await db.initiativeApplication.create({ data: payload })
  return application
}
