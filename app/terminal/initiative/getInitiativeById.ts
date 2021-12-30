import db from "db"
import * as z from "zod"

// type Initiative {
// 	id: String
// 	terminalId: String
// 	localId: Number // on-chain integer to identify within terminal's graph
// 	applications: InitiativeApplication[]
// 	openings: Number
// 	name: String
// 	shortName: String
// 	description: String
// 	links: JSON // [{type: "", url: ""}, ...]
// 	banner: String
// 	contributeText: String
// 	rewardText: String
// }

const GetInitiativeById = z.object({
  id: z.number(),
})

export default async function getTerminalById(input: z.infer<typeof GetInitiativeById>) {
  const data = GetInitiativeById.parse(input)
  const initiative = await db.initiative.findFirst({ where: { id: data.id } })

  return initiative
}
