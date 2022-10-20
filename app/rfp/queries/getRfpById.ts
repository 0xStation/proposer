import db from "db"
import * as z from "zod"
import { Rfp } from "../types"

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
      },
    })

    if (!rfp) {
      return null
    }

    return rfp as Rfp
  } catch (err) {
    console.error("Error in `getRfpById`", err)
    return null
  }
}
