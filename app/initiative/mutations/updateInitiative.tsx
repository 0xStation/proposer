import db from "db"
import * as z from "zod"
import { Initiative } from "../types"

const UpdateInitiative = z.object({
  id: z.number(),
  name: z.string(),
  oneLiner: z.string(),
  bannerURL: z.string(),
  commitment: z.string(),
  rewardText: z.string(),
  contributeText: z.string(),
  isAcceptingApplications: z.boolean(),
  skills: z
    .object({
      value: z.string(),
      label: z.string(),
    })
    .array(),
})

export default async function updateInitiative(input: z.infer<typeof UpdateInitiative>) {
  const params = UpdateInitiative.parse(input)

  const existingInitiative = await db.initiative.findUnique({
    where: { id: params.id },
  })

  if (!existingInitiative) {
    console.log("cannot update an initiative that does not exist")
    return null
  }

  const payload = {
    data: {
      oneLiner: params.oneLiner,
      bannerURL: params.bannerURL,
      name: params.name,
      commitment: params.commitment,
      rewardText: params.rewardText,
      contributeText: params.contributeText,
      isAcceptingApplications: params.isAcceptingApplications,
      skills: params.skills.map((skill) => skill.label),
    },
  }

  const initiative = await db.initiative.update({
    where: {
      id: params.id,
    },
    data: payload,
  })
  return initiative as Initiative
}
