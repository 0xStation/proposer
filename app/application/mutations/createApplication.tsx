import db from "db"
import * as z from "zod"

const CreateApplication = z.object({
  urls: z.string().array(),
  entryDescription: z.string(),
  accountId: z.number(),
  initiativeId: z.number(),
})

export default async function createApplication(input: z.infer<typeof CreateApplication>) {
  const params = CreateApplication.parse(input)

  const payload = {
    data: {
      approved: false,
      urls: params.urls,
      entryDescription: params.entryDescription,
    },
    account: { connect: { id: params.accountId } },
    initiative: { connect: { id: params.initiativeId } },
  }

  const application = await db.accountInitiative.create({ data: payload })
  return application
}
