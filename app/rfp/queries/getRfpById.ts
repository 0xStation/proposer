import db from "db"
import * as z from "zod"
import { Rfp } from "../types"

const GetRfpById = z.object({
  id: z.string(),
})

export default async function getRfpById(params: z.infer<typeof GetRfpById>) {
  const rfp = await db.rfp.findUnique({
    where: {
      id: params.id,
    },
  })

  if (!rfp) {
    return null
  }

  return rfp as unknown as Rfp
}
