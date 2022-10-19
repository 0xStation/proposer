import * as z from "zod"
import db, { RfpStatus } from "db"
import { Rfp } from "../types"

const UpdateRfpStatus = z.object({
  rfpId: z.string(),
  status: z.string(),
})

export default async function updateRfpStatus(input: z.infer<typeof UpdateRfpStatus>) {
  const params = UpdateRfpStatus.parse(input)
  try {
    const rfp = await db.rfp.update({
      where: { id: params.rfpId },
      data: {
        status: params.status as RfpStatus,
      },
    })

    return rfp as Rfp
  } catch (err) {
    console.error(`Failed to close RFP ${params.status}`, err)
    throw err
  }
}
