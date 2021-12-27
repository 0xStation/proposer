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
      ...(i.data as Object),
    } as Initiative & InitiativeMetadata
  })
}
