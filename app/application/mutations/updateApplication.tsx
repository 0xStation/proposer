import db from "db"
import z from "zod"

const UpdateApplication = z.object({
  accountId: z.number(),
  initiativeId: z.number(),
  data: z.object({
    url: z.string().optional(),
    entryDescription: z.string().optional(),
    pointsValue: z.number().optional(),
  }),
})

export default async function updateApplication(input: z.infer<typeof UpdateApplication>) {
  const { accountId, initiativeId, data } = UpdateApplication.parse(input)

  try {
    const application = await db.accountInitiative.update({
      where: {
        accountId_initiativeId: {
          accountId: accountId,
          initiativeId: initiativeId,
        },
      },
      data: { data },
    })

    return application
  } catch (err) {
    console.error(
      `Error: could not update application for account ${accountId} and intiativeId ${initiativeId}`,
      JSON.stringify(err)
    )
    return null
  }
}
