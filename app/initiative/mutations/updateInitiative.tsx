import db from "db"
import * as z from "zod"
import { Initiative } from "../types"

const UpdateInitiative = z.object({
  bannerURL: z.string(),
  commitment: z.string(),
  contributeText: z.union([z.string(), z.string().array()]).optional(),
  existingSkills: z
    .object({
      value: z.string(),
      label: z.string(),
      id: z.number(),
    })
    .array(),
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
      bannerURL: params.bannerURL,
      commitment: params.commitment,
      contributeText: params.contributeText,
      isAcceptingApplications: params.isAcceptingApplications,
      links: params.links,
      name: params.name,
      oneLiner: params.oneLiner,
      rewardText: params.rewardText,
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
