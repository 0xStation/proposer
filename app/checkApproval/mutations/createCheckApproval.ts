import db from "db"
import * as z from "zod"

const CreateCheckApproval = z.object({
  checkId: z.string(),
  signerAddress: z.string(),
  signature: z.string(),
})

export default async function createCheckApproval(input: z.infer<typeof CreateCheckApproval>) {
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
