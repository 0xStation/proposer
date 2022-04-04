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
    const referrals = await db.endorsement.groupBy({
      by: ["endorserId", "endorsementValue"],
      _sum: {
        endorsementValue: true,
      },
      orderBy: {
        _sum: {
          endorsementValue: "desc",
        },
      },
      where: {
        initiativeId: params.initiativeId,
        endorseeId: params.endorseeId,
      },
    })
    const endorserIds = referrals.map((referral) => referral.endorserId)
    const endorsers = await db.account.findMany({ where: { id: { in: endorserIds } } })

    let referrers = [] as any[]
    referrals.forEach((referral) => {
      referrers.push({
        endorserId: referral.endorserId,
        endorsementsGiven: referral._sum.endorsementValue,
        endorser: endorsers.find((endorser) => endorser.id === referral.endorserId),
      })
    })

    return referrers as Referral[]
  } catch (err) {
    console.error(
      `Error retrieving referrals for endorsee ${params.endorseeId} and initiative ${params.initiativeId}. Failed with error ${err}`
    )
    return []
  }
}

export default getReferralsByApplication
