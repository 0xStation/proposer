import db from "db"
import * as z from "zod"
import { Referral } from "../types"

const GetReferralsByApplication = z.object({
  initiativeId: z.number(),
  endorseeId: z.number(),
})

export async function getReferralsByApplication(input: z.infer<typeof GetReferralsByApplication>) {
  const params = GetReferralsByApplication.parse(input)

  try {
    const referrals = await db.endorsement.findMany({
      distinct: ["endorserId"],
      orderBy: {
        endorsementValue: "desc",
      },
      where: {
        initiativeId: params.initiativeId,
        endorseeId: params.endorseeId,
      },
      select: {
        endorsementValue: true,
        endorser: true,
      },
    })

    return referrals as Referral[]
  } catch (err) {
    console.error(
      `Error retrieving referrals for endorsee ${params.endorseeId} and initiative ${params.initiativeId}. Failed with error ${err}`
    )
    return []
  }
}

export default getReferralsByApplication
