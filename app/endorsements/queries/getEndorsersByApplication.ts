import { Account } from "app/account/types"
import db from "db"
import * as z from "zod"

const GetEndorsersByApplication = z.object({
  initiativeId: z.number(),
  endorseeId: z.number(),
})

export async function getEndorsersByApplication(input: z.infer<typeof GetEndorsersByApplication>) {
  const params = GetEndorsersByApplication.parse(input)

  const endorsers = await db.endorsement.findMany({
    distinct: ["endorserId"],
    orderBy: {
      endorsementValue: "desc",
    },
    where: {
      initiativeId: params.initiativeId,
      endorseeId: params.endorseeId,
    },
    select: {
      endorser: true,
    },
  })

  return endorsers.map((endorserObj) => endorserObj.endorser as Account) as Account[]
}

export default getEndorsersByApplication
