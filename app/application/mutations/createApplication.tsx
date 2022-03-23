import db from "db"
import * as z from "zod"

const CreateApplication = z.object({
  url: z.string(),
  entryDescription: z.string(),
  accountId: z.number(),
  initiativeId: z.number(),
  pointsValue: z.number().optional(),
})

export default async function createApplication(input: z.infer<typeof CreateApplication>) {
  const params = CreateApplication.parse(input)

  const payload = {
    data: {
      approved: false,
      url: params.url,
      entryDescription: params.entryDescription,
      pointsValue: params.pointsValue || 0,
    },
    account: { connect: { id: params.accountId } },
    initiative: { connect: { id: params.initiativeId } },
  }

  const application = await db.accountInitiative.create({ data: payload })
  return application
}
