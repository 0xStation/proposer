import db from "db"
import * as z from "zod"
import { Checkbook } from "../types"

const GetCheckbooks = z.object({
  ids: z
    .object({
      chainId: z.number(),
      address: z.string(),
    })
    .array(),
})

export default async function getCheckbooks(input: z.infer<typeof GetCheckbooks>) {
  const params = GetCheckbooks.parse(input)

  const checkbooks = await db.checkbook.findMany({
    // where: {
    //   OR: params.ids.map(({ chainId, address }) => {
    //     return {
    //       chainId_address: {
    //         chainId,
    //         address,
    //       },
    //     }
    //   }),
    // },
  })

  return checkbooks as unknown as Checkbook[]
}
