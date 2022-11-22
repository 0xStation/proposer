import db from "db"
import * as z from "zod"
import { Rfp } from "../types"
import { getRfpStatus } from "../utils"

const GetRfpById = z.object({
  id: z.string(),
})

export default async function getRfpById(params: z.infer<typeof GetRfpById>) {
  try {
    const rfp = await db.rfp.findUnique({
      where: {
        id: params.id,
      },
      include: {
        account: true,
        template: true,
      },
    })

    if (!rfp) {
      return null
    }

    return { ...rfp, status: getRfpStatus(rfp.status, rfp.startDate, rfp.endDate) } as Rfp
  } catch (err) {
    console.error("Error in `getRfpById`", err)
    return null
  }
}
