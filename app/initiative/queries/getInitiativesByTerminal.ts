import db, { Initiative } from "db"
import * as z from "zod"

const GetInitiativesByTerminal = z.object({
  terminalId: z.number(),
})

type InitiativeMetadata = {
  name: string
  description: string
  shortName: string
  bannerURL: string
  pfpURL: string
  contributeText: string
  rewardText: string
  openings: number
}

export default async function getInitiativesByTerminal(
  input: z.infer<typeof GetInitiativesByTerminal>
) {
  const data = GetInitiativesByTerminal.parse(input)
  const initiatives = await db.initiative.findMany({ where: { terminal: { id: data.terminalId } } })

  if (!initiatives) {
    return null
  }

  return initiatives.map((i) => {
    return {
      ...i,
      name: i.data!["name"],
      shortName: i.data!["shortName"],
      description: i.data!["description"],
      bannerURL: i.data!["bannerURL"],
      pfpURL: i.data!["pfpURL"],
      contributeText: i.data!["contributeText"],
      rewardText: i.data!["rewardText"],
      openings: i.data!["openings"],
    } as Initiative & InitiativeMetadata
  })
}
