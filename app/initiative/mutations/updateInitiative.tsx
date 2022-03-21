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
  skills: z
    .object({
      value: z.string(),
      label: z.string(),
    })
    .array(),
  existingSkills: z
    .object({
      value: z.string(),
      label: z.string(),
      id: z.number(),
    })
    .array(),
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

  const existingSkillValues = params.existingSkills.map((skill) => skill.value)
  const incomingSkillValues = params.skills.map((skill) => skill.value)

  const newSkills = params.skills.filter((skill) => !existingSkillValues.includes(skill.value))
  const removedSkills = params.existingSkills.filter(
    (skill) => !incomingSkillValues.includes(skill.value)
  )

  const payload = {
    data: {
      oneLiner: params.oneLiner,
      bannerURL: params.bannerURL,
      name: params.name,
      commitment: params.commitment,
      rewardText: params.rewardText,
      contributeText: params.contributeText,
      links: params.links,
      isAcceptingApplications: params.isAcceptingApplications,
    },
    skills: {
      delete: removedSkills.map((skill) => {
        return {
          initiativeId_skillId: {
            initiativeId: params.id,
            skillId: skill.id,
          },
        }
      }),
      create: newSkills.map((skill) => {
        return {
          skill: {
            connectOrCreate: {
              where: {
                name: skill.value.toLowerCase(),
              },
              create: {
                name: skill.value.toLowerCase(),
              },
            },
          },
        }
      }),
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
