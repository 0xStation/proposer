import db from "db"
import * as z from "zod"
import { Endorsement } from "../types"

const GetEndorsementsByApplication = z.object({
  initiativeId: z.number(),
  endorseeId: z.number(),
})

export async function getEndorsementsByApplication(
  input: z.infer<typeof GetEndorsementsByApplication>
) {
  const params = GetEndorsementsByApplication.parse(input)

  try {
    const endorsements = await db.endorsement.findMany({
      where: {
        initiativeId: params.initiativeId,
        endorseeId: params.endorseeId,
      },
      include: {
        endorser: true,
      },
    })

    return endorsements as Endorsement[]
  } catch (err) {
    console.error(
      `Error fetching endorsements with endorseeId ${params.endorseeId} and initiativeId ${params.initiativeId}. Failed with error ${err}`
    )
    return []
  }
}

export default getEndorsementsByApplication
