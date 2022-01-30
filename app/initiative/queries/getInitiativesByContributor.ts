import db from "db"
import * as z from "zod"
import { Initiative } from "../types"

// const GetInitiativeByLocalId = z.object({
//   contributorId: z.number()
// })

// export default async function getInitiativeByLocalId(
//   input: z.infer<typeof GetInitiativeByLocalId>
// ) {
//   const data = GetInitiativeByLocalId.parse(input)
//   const initiative = await db.initiative.findMany({
//     where: { contributors: { } },
//   })

//   if (!initiative) {
//     return null
//   }

//   return initiative as Initiative
// }
