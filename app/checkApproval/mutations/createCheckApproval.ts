import db from "db"
import * as z from "zod"
import { signatureToVRS } from "app/core/utils/signatureToVRS"

const CreateCheckApproval = z.object({
  checkId: z.string(),
  signerAddress: z.string(),
  signature: z.string(),
})

export default async function createCheckApproval(input: z.infer<typeof CreateCheckApproval>) {
  // batch nonce generation and check creation in transaction for ACID guarantees to solve nonce race conditions
  const checkApproval = await db.checkApproval.create({
    data: {
      checkId: input.checkId,
      signerAddress: input.signerAddress,
      data: {
        signature: input.signature,
        ...signatureToVRS(input.signature),
      },
    },
  })

  return checkApproval
}
