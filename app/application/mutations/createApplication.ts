import db from "db"
import * as z from "zod"

const CreateApplication = z.object({
  url: z.string(),
  applicant: z.number(), // id let it fail if the id does not exist?
  initiative: z.number(), // id
})

export default async function createApplication(input: z.infer<typeof CreateApplication>) {
  const data = CreateApplication.parse(input)
  const payload = {
    ...data,
    approved: false,
    applicant: { connect: { id: data.applicant } },
    initiative: { connect: { id: data.initiative } },
  }

  const application = await db.initiativeApplication.create({ data: payload })

  return application
}
