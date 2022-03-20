import db from "db"
import * as z from "zod"
import { Initiative } from "../types"

// todo, we are accidentally wiping out existing skills
const UpdateInitiative = z.object({
  id: z.number(),
  name: z.string(),
  oneLiner: z.string(),
  bannerURL: z.string(),
  commitment: z.string(),
  rewardText: z.union([z.string(), z.string().array()]),
  contributeText: z.union([z.string(), z.string().array()]),
  isAcceptingApplications: z.boolean(),
  skills: z.string().array(),
  links: z.string().array(),
})

export default async function updateInitiative(input: z.infer<typeof UpdateInitiative>) {
  const params = UpdateInitiative.parse(input)

  const existingInitiative = await db.initiative.findUnique({
    where: { id: params.id },
  })

  if (!existingInitiative) {
    console.error("cannot update an initiative that does not exist")
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
      skills: params.skills,
      links: params.links,
      isAcceptingApplications: params.isAcceptingApplications,
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
