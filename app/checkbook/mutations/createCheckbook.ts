import db from "db"
import * as z from "zod"
import { Checkbook } from "../types"

const CreateCheckbook = z.object({
  chainId: z.number(),
  address: z.string(),
  name: z.string(),
  safeTxHash: z.string().optional(),
})

export default async function createCheckbook(input: z.infer<typeof CreateCheckbook>) {
  const params = CreateCheckbook.parse(input)

  // auth a signature from safe signer

  const checkbook = await db.checkbook.upsert({
    where: {
      chainId_address: {
        chainId: params.chainId,
        address: params.address,
      },
    },
    update: {},
    create: {
      chainId: params.chainId,
      address: params.address,
      data: {
        name: params.name,
        creationSafeTxHash: params.safeTxHash,
      },
    },
  })

  return checkbook as unknown as Checkbook
}
