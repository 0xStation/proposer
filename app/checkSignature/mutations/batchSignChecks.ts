import * as z from "zod"
import db from "db"

const BatchSignCheck = z.object({
  signerAddress: z.string(),
  message: z.any(),
  signature: z.string(),
  checkIdAndPath: z
    .object({
      checkId: z.string(),
      path: z.any().array(),
    })
    .array(),
  root: z.string(),
})

export default async function batchSignCheck(input: z.infer<typeof BatchSignCheck>) {
  const params = BatchSignCheck.parse(input)

  const signature = await db.checkSignature.create({
    data: {
      signer: params.signerAddress,
      root: params.root,
      data: {
        message: params.message,
        signature: params.signature,
      },
    },
  })
  // missing auth

  const proof = await db.proof.createMany({
    data: params.checkIdAndPath.map((checkIdAndPath) => ({
      checkId: checkIdAndPath.checkId,
      checkSignatureId: signature.id,
      data: {
        path: checkIdAndPath.path,
      },
    })),
  })
}
