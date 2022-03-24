import db from "db"
import * as z from "zod"

const GetEndorsementsByApplication = z.object({
  initiativeId: z.number(),
  endorseeId: z.number(),
})

export async function getEndorsementsByApplication(
  input: z.infer<typeof GetEndorsementsByApplication>
) {
  const params = GetEndorsementsByApplication.parse(input)

  const endorsements = await db.endorsement.findMany({
    where: {
      initiativeId: params.initiativeId,
      endorseeId: params.endorseeId,
    },
    include: {
      endorser: true,
      endorsee: true,
    },
  })

  return endorsements
}

export default getEndorsementsByApplication
