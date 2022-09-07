import db from "db"
import * as z from "zod"
import { Ctx } from "blitz"

const CreateCheckApproval = z.object({
  checkId: z.string(),
  signerAddress: z.string(),
  signature: z.string(),
})

export default async function createCheckApproval(
  input: z.infer<typeof CreateCheckApproval>,
  ctx: Ctx
) {
  const check = await db.check.findUnique({
    where: {
      id: input.checkId,
    },
    include: {
      checkbook: true,
    },
  })

  if (!check) {
    throw new Error("Cannot cash a check that does not exist.")
  }

  ctx.session.$authorize(check.checkbook.signers, [])

  const checkApproval = await db.checkApproval.create({
    data: {
      checkId: input.checkId,
      signerAddress: input.signerAddress,
      data: {
        signature: input.signature,
      },
    },
  })

  return checkApproval
}
