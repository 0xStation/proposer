import db from "db"
import * as z from "zod"
import { Checkbook } from "../types"

const GetCheckbook = z.object({
  chainId: z.number(),
  address: z.string(),
})

export default async function getCheckbook(input: z.infer<typeof GetCheckbook>) {
  const params = GetCheckbook.parse(input)

  const checkbook = await db.checkbook.findUnique({
    where: {
      chainId_address: {
        chainId: params.chainId,
        address: params.address,
      },
    },
  })

  return checkbook as unknown as Checkbook
}
