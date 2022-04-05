import db from "db"
import * as z from "zod"

const HasUserEndorsedApplicant = z.object({
  initiativeId: z.number(),
  endorseeId: z.number(),
  endorserId: z.number(),
})

export async function hasUserEndorsedApplicant(input: z.infer<typeof HasUserEndorsedApplicant>) {
  const params = HasUserEndorsedApplicant.parse(input)

  try {
    const endorsement = await db.endorsement.findFirst({
      where: {
        initiativeId: params.initiativeId,
        endorseeId: params.endorseeId,
        endorserId: params.endorserId,
      },
    })

    return !!endorsement
  } catch (err) {
    console.error(
      `Error retrieving endorsement for endorsee ${params.endorseeId} and endorser ${params.endorserId}. Failed with error ${err}`
    )
    return false
  }
}

export default hasUserEndorsedApplicant
