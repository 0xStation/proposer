import * as z from "zod"
import db, { RfpStatus } from "db"
import { Rfp } from "../types"

const CloseRfp = z.object({
  rfpId: z.string(),
})

export default async function closeRfp(input: z.infer<typeof CloseRfp>) {
  const params = CloseRfp.parse(input)

  //   auth

  const rfp = await db.rfp.update({
    where: { id: params.rfpId },
    data: {
      status: RfpStatus.CLOSED,
    },
  })

  return rfp as Rfp
}
