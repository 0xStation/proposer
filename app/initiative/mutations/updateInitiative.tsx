import db from "db"
import * as z from "zod"
import { Initiative } from "../types"

const UpdateInitiative = z.object({
  bannerURL: z.string(),
  commitment: z.string().optional(),
  contributeText: z.union([z.string(), z.string().array()]).optional(),
  id: z.number(),
  isAcceptingApplications: z.boolean(),
  links: z
    .object({
      url: z.string(),
      symbol: z.number(),
    })
    .array()
    .optional(),
  name: z.string(),
  oneLiner: z.string(),
  rewardText: z.union([z.string(), z.string().array()]),
  skills: z.string().array(),
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
      bannerURL: params.bannerURL,
      commitment: params.commitment,
      contributeText: params.contributeText,
      isAcceptingApplications: params.isAcceptingApplications,
      links: params.links,
      name: params.name,
      oneLiner: params.oneLiner,
      rewardText: params.rewardText,
      skills: params.skills,
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
