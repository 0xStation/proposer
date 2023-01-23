import db from "db"
import * as z from "zod"
import { Check } from "../types"

const GetCheck = z.object({
  checkId: z.string(),
})

export default async function getCheck(input: z.infer<typeof GetCheck>) {
  const params = GetCheck.parse(input)

  const check = await db.check.findUnique({
    where: {
      id: params.checkId,
    },
    include: {
      inbox: true,
      proofs: {
        include: {
          signature: true,
        },
      },
    },
  })

  return check as unknown as Check
}
