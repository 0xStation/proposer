import * as z from "zod"
import db from "db"

const SignCheck = z.object({
  signerAddress: z.string(),
  message: z.any(),
  signature: z.string(),
  checkId: z.string(),
  root: z.string(),
  path: z.any().array(),
})

export default async function signCheck(input: z.infer<typeof SignCheck>) {
  const params = SignCheck.parse(input)

  // missing auth

  const proof = await db.proof.create({
    data: {
      data: {
        path: params.path,
      },
      check: {
        connect: { id: params.checkId },
      },
      signature: {
        create: {
          signer: params.signerAddress,
          root: params.root,
          data: {
            message: params.message,
            signature: params.signature,
          },
        },
      },
    },
  })

  return proof
}
