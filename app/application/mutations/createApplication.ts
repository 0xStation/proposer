import db from "db"
import * as z from "zod"

const CreateApplication = z.object({
  url: z.string(),
  applicantId: z.number().optional(), // if no applicant ID -- we should try to create a new applicant
  applicantAddress: z.string().optional(),
  initiativeId: z.number(), // id
})

export default async function createApplication(input: z.infer<typeof CreateApplication>) {
  const params = CreateApplication.parse(input)

  let applicantPayload
  if (params.applicantId) {
    applicantPayload = { connect: { id: params.applicantId } }
  } else {
    applicantPayload = { create: { data: { name: "michael" }, address: "0x" } }
  }

  const payload = {
    data: {
      approved: false,
      url: params.url,
    },
    applicant: applicantPayload,
    initiative: { connect: { id: params.initiativeId } },
  }

  const application = await db.initiativeApplication.create({ data: payload })

  return application
}
